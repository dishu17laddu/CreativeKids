
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "8mb" }));

// Temporary artwork data
let artworks = [
  {
    id: 1,
    title: "Rainbow Garden",
    artist: "Young Artist",
    category: "Painting",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
    uploadedByUser: false
  },
  {
    id: 2,
    title: "Nature's Beauty",
    artist: "Creative Artist",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600",
    uploadedByUser: false
  },
  {
    id: 3,
    title: "Colourful World",
    artist: "Little Artist",
    category: "Drawing",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
    uploadedByUser: false
  }
];

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the CreativeKids Backend!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CreativeKids server is running!"
  });
});

// GET: Fetch all artworks
app.get("/api/artworks", (req, res) => {
  res.json({
    success: true,
    count: artworks.length,
    artworks
  });
});

// POST: Add a new artwork
app.post("/api/artworks", (req, res) => {
  const { title, artist, category, image } = req.body;

  if (!title || !artist || !category) {
    return res.status(400).json({
      success: false,
      message: "Title, artist and category are required."
    });
  }

  const newArtwork = {
    id: Date.now(),
    title: title.trim(),
    artist: artist.trim(),
    category,
    image: image || "",
    uploadedByUser: true
  };

  artworks.unshift(newArtwork);

  res.status(201).json({
    success: true,
    message: "Artwork added successfully!",
    artwork: newArtwork
  });
});

// PUT: Update an artwork
app.put("/api/artworks/:id", (req, res) => {
  const artwork = artworks.find(
    (item) => String(item.id) === req.params.id
  );

  if (!artwork) {
    return res.status(404).json({
      success: false,
      message: "Artwork not found."
    });
  }

  const { title, artist, category, image } = req.body;

  if (title !== undefined) artwork.title = title;
  if (artist !== undefined) artwork.artist = artist;
  if (category !== undefined) artwork.category = category;
  if (image !== undefined) artwork.image = image;

  res.json({
    success: true,
    message: "Artwork updated successfully!",
    artwork
  });
});

// DELETE: Remove an artwork
app.delete("/api/artworks/:id", (req, res) => {
  const oldLength = artworks.length;

  artworks = artworks.filter(
    (item) => String(item.id) !== req.params.id
  );

  if (artworks.length === oldLength) {
    return res.status(404).json({
      success: false,
      message: "Artwork not found."
    });
  }

  res.json({
    success: true,
    message: "Artwork deleted successfully!"
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CreativeKids backend running at http://localhost:${PORT}`);
});
