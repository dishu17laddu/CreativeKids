
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Parent from "./models/Parent.js";
import Artwork from "./models/Artwork.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Middleware
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Parent authentication middleware
function authenticateParent(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in as a parent to continue."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authentication."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.parentId) {
      return res.status(401).json({
        success: false,
        message: "Invalid parent session."
      });
    }

    req.parentId = decoded.parentId;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login. Please log in again."
    });
  }
}

// Create parent login token
function createParentToken(parent) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }

  return jwt.sign(
    { parentId: parent._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

// Parent registration
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name and email. Password must be 8–128 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingParent = await Parent.findOne({
      email: normalizedEmail
    });

    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please sign in."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Parent.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Please sign in."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    next(error);
  }
});

// Parent login
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password."
      });
    }

    const parent = await Parent.findOne({
      email: email.trim().toLowerCase()
    }).select("+passwordHash");

    if (
      !parent ||
      !(await bcrypt.compare(password, parent.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = createParentToken(parent);

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      parent: {
        id: parent._id.toString(),
        name: parent.name,
        email: parent.email
      }
    });

  } catch (error) {
    next(error);
  }
});

// Validate artwork image
function validateArtworkImage(image) {
  if (image === undefined || image === null || image === "") {
    return null;
  }

  if (typeof image !== "string") {
    return "Image must be a valid image data URL.";
  }

  const match = image.match(
    /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/
  );

  if (!match) {
    return "Use a PNG, JPEG, WEBP, or GIF image.";
  }

  const base64 = match[2];

  if (base64.length % 4 !== 0) {
    return "The image data is invalid.";
  }

  const bytes = Buffer.from(base64, "base64");

  if (bytes.toString("base64") !== base64) {
    return "The image data is invalid.";
  }

  if (bytes.length > MAX_IMAGE_BYTES) {
    return "Image size must not exceed 2 MB.";
  }

  return null;
}

// Home route
app.get("/", (req, res) => {
  res.send("CreativeKids API is running!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// Get all artworks for the public gallery
app.get("/api/artworks", async (req, res, next) => {
  try {
    const artworks = await Artwork.find()
      .select("-parentId")
      .sort({ createdAt: -1, id: -1 })
      .lean();

    res.json({
      success: true,
      count: artworks.length,
      artworks: artworks.map(({ _id, __v, ...art }) => art)
    });

  } catch (error) {
    next(error);
  }
});

// Get only the logged-in parent's artworks
app.get("/api/my-artworks", authenticateParent, async (req, res, next) => {
  try {
    const artworks = await Artwork.find({
      parentId: req.parentId
    })
      .select("-parentId")
      .sort({ createdAt: -1, id: -1 })
      .lean();

    res.json({
      success: true,
      count: artworks.length,
      artworks: artworks.map(({ _id, __v, ...art }) => art)
    });

  } catch (error) {
    next(error);
  }
});

// Add a new artwork
app.post("/api/artworks", authenticateParent, async (req, res, next) => {
  try {
    const { title, artist, category, image } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof artist !== "string" ||
      !artist.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Artwork title and artist name are required."
      });
    }

    const imageError = validateArtworkImage(image);

    if (imageError) {
      return res.status(400).json({
        success: false,
        message: imageError
      });
    }

    const latestArtwork = await Artwork.findOne()
      .sort({ id: -1 })
      .select("id")
      .lean();

    const nextId = (latestArtwork?.id || 0) + 1;

    const artwork = await Artwork.create({
      id: nextId,
      title: title.trim(),
      artist: artist.trim(),
      category:
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Drawing",
      image: image || "",
      parentId: req.parentId
    });

    const result = artwork.toObject();
    delete result._id;
    delete result.__v;
    delete result.parentId;

    res.status(201).json({
      success: true,
      message: "Artwork added successfully!",
      artwork: result
    });

  } catch (error) {
    next(error);
  }
});

// Edit only the logged-in parent's artwork
app.put("/api/artworks/:id", authenticateParent, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid artwork ID."
      });
    }

    const { title, artist, category, image } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title must not be empty."
        });
      }

      updates.title = title.trim();
    }

    if (artist !== undefined) {
      if (typeof artist !== "string" || !artist.trim()) {
        return res.status(400).json({
          success: false,
          message: "Artist name must not be empty."
        });
      }

      updates.artist = artist.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category must not be empty."
        });
      }

      updates.category = category.trim();
    }

    if (image !== undefined) {
      const imageError = validateArtworkImage(image);

      if (imageError) {
        return res.status(400).json({
          success: false,
          message: imageError
        });
      }

      updates.image = image || "";
    }

    const artwork = await Artwork.findOneAndUpdate(
      {
        id,
        parentId: req.parentId
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-parentId");

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found or you do not have permission to edit it."
      });
    }

    const result = artwork.toObject();
    delete result._id;
    delete result.__v;

    res.json({
      success: true,
      message: "Artwork updated successfully!",
      artwork: result
    });

  } catch (error) {
    next(error);
  }
});

// Delete only the logged-in parent's artwork
app.delete("/api/artworks/:id", authenticateParent, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid artwork ID."
      });
    }

    const artwork = await Artwork.findOneAndDelete({
      id,
      parentId: req.parentId
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found or you do not have permission to delete it."
      });
    }

    res.json({
      success: true,
      message: "Artwork deleted successfully!"
    });

  } catch (error) {
    next(error);
  }
});

// Handle invalid API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Handle errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request."
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request too large. Artwork images must not exceed 2 MB."
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An artwork ID conflict occurred. Please try again."
    });
  }

  console.error("API error:", err.message);

  res.status(500).json({
    success: false,
    message: "A server error occurred."
  });
});

// Connect to MongoDB before starting backend
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(
        `CreativeKids backend running at http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
