
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];

function ArtworkUpload({ onArtworkAdded }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("Drawing");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setImage("");
    setImageName("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      setMessage("Choose a PNG, JPEG, WEBP, or GIF image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setMessage("Image size must not exceed 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setMessage("Could not read the selected image.");
        return;
      }

      const base64 = reader.result.split(",")[1] || "";

      const validSignatures = {
        "image/jpeg": base64.startsWith("/9j/"),
        "image/png": base64.startsWith("iVBOR"),
        "image/webp": base64.startsWith("UklGR"),
        "image/gif": base64.startsWith("R0lGOD")
      };

      if (!validSignatures[file.type]) {
        setImage("");
        setImageName("");
        event.target.value = "";
        setMessage(
          "Invalid image data. Please select a genuine image file."
        );
        return;
      }

      setImage(reader.result);
      setImageName(file.name);
      setMessage("");
    };

    reader.onerror = () => {
      setImage("");
      setImageName("");
      setMessage("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !artist.trim()) {
      setMessage("Please enter the artwork title and artist name.");
      return;
    }

    if (!image) {
      setMessage("Please select a valid artwork image.");
      return;
    }

    setLoading(true);

    try {
      await onArtworkAdded({
        title: title.trim(),
        artist: artist.trim(),
        category,
        image
      });

      navigate("/");
    } catch (error) {
      setMessage(
        error.message || "Artwork upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "30px 16px",
      background: "#f7f8ff",
      fontFamily: "Arial, sans-serif"
    },
    card: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "28px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    },
    label: {
      display: "block",
      marginTop: "16px",
      fontWeight: "bold"
    },
    input: {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      marginTop: "7px",
      border: "1px solid #ccd2df",
      borderRadius: "8px",
      fontSize: "15px"
    },
    button: {
      width: "100%",
      padding: "13px",
      marginTop: "22px",
      border: "none",
      borderRadius: "8px",
      background: "#6c4ce4",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: loading ? "wait" : "pointer",
      opacity: loading ? 0.7 : 1
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Back to Home
        </Link>

        <h1>🎨 Upload Your Artwork</h1>
        <p>Share your creativity with the CreativeKids community!</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>
            Artwork Title
            <input
              style={styles.input}
              type="text"
              placeholder="Enter artwork title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
            />
          </label>

          <label style={styles.label}>
            Artist Name
            <input
              style={styles.input}
              type="text"
              placeholder="Enter artist name"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              maxLength={100}
              required
            />
          </label>

          <label style={styles.label}>
            Category
            <select
              style={styles.input}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Drawing">Drawing</option>
              <option value="Painting">Painting</option>
              <option value="Nature">Nature</option>
              <option value="Craft">Craft</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label style={styles.label}>
            Select Artwork Image (maximum 2 MB)
            <input
              style={styles.input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={loading}
            />
          </label>

          <p style={{ fontSize: "13px", color: "#555" }}>
            Supported formats: PNG, JPEG, WEBP, and GIF.
          </p>

          {imageName && <p>Selected image: {imageName}</p>}

          {image && (
            <img
              src={image}
              alt="Artwork preview"
              style={{
                display: "block",
                width: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                marginTop: "15px",
                borderRadius: "10px"
              }}
            />
          )}

          {message && (
            <p
              role="alert"
              style={{ color: "#b42318", marginTop: "15px" }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Artwork 🎨"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ArtworkUpload;
