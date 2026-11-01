
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/my-artworks";
const ARTWORK_URL = "http://localhost:5000/api/artworks";

function ParentDashboard() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    category: "Drawing"
  });

  let parent = {};

  try {
    parent = JSON.parse(localStorage.getItem("parentInfo") || "{}");
  } catch {
    parent = {};
  }

  useEffect(() => {
    async function loadMyArtworks() {
      try {
        const token = localStorage.getItem("parentToken");

        if (!token) {
          throw new Error("Please log in again to view your artworks.");
        }

        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load your artworks.");
        }

        setArtworks(data.artworks || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadMyArtworks();
  }, []);

  function startEditing(art) {
    setEditingId(art.id);
    setEditForm({
      title: art.title || "",
      artist: art.artist || "",
      category: art.category || "Drawing"
    });
    setError("");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({
      title: "",
      artist: "",
      category: "Drawing"
    });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSave(art) {
    if (!editForm.title.trim() || !editForm.artist.trim()) {
      setError("Please enter both the artwork title and artist name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("parentToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${ARTWORK_URL}/${encodeURIComponent(art.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            artist: editForm.artist.trim(),
            category: editForm.category.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update artwork.");
      }

      setArtworks((previous) =>
        previous.map((item) =>
          item.id === art.id
            ? { ...item, ...editForm }
            : item
        )
      );

      setEditingId(null);
      setMessage("Artwork updated successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong while updating.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(art) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${art.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(art.id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("parentToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${ARTWORK_URL}/${encodeURIComponent(art.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete artwork.");
      }

      setArtworks((previous) =>
        previous.filter((item) => item.id !== art.id)
      );

      if (editingId === art.id) {
        cancelEditing();
      }

      setMessage("Artwork deleted successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      background: "#f4f6fb",
      fontFamily: "Arial, sans-serif",
      color: "#26324b"
    },
    sidebar: {
      width: "230px",
      minWidth: "230px",
      background: "#30265f",
      color: "white",
      padding: "28px 18px",
      boxSizing: "border-box"
    },
    logo: {
      fontSize: "23px",
      fontWeight: "bold",
      marginBottom: "45px"
    },
    sideLink: {
      display: "block",
      color: "white",
      textDecoration: "none",
      padding: "13px",
      marginBottom: "12px",
      borderRadius: "9px",
      background: "rgba(255,255,255,0.10)"
    },
    main: {
      flex: 1,
      minWidth: 0,
      padding: "35px",
      boxSizing: "border-box"
    },
    welcome: {
      background: "white",
      padding: "25px",
      borderRadius: "15px",
      marginBottom: "25px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
    },
    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "18px",
      marginBottom: "28px"
    },
    card: {
      background: "white",
      padding: "23px",
      borderRadius: "14px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
    },
    number: {
      fontSize: "32px",
      fontWeight: "bold",
      margin: "12px 0",
      color: "#6551c7"
    },
    section: {
      background: "white",
      padding: "25px",
      borderRadius: "15px",
      marginBottom: "22px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
    },
    actionLink: {
      display: "inline-block",
      padding: "11px 17px",
      margin: "8px 8px 0 0",
      borderRadius: "8px",
      background: "#6551c7",
      color: "white",
      textDecoration: "none",
      fontWeight: "bold"
    },
    artwork: {
      padding: "16px 0",
      borderBottom: "1px solid #eeeeF4"
    },
    muted: {
      color: "#727b91",
      fontSize: "14px"
    },
    artworkImage: {
      width: "120px",
      height: "90px",
      objectFit: "cover",
      borderRadius: "8px",
      marginTop: "8px",
      display: "block"
    },
    editButton: {
      marginTop: "12px",
      marginRight: "8px",
      padding: "9px 15px",
      background: "#6551c7",
      color: "white",
      border: "none",
      borderRadius: "7px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    deleteButton: {
      marginTop: "12px",
      padding: "9px 15px",
      background: "#d92d20",
      color: "white",
      border: "none",
      borderRadius: "7px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    input: {
      display: "block",
      width: "100%",
      maxWidth: "420px",
      padding: "10px",
      marginTop: "7px",
      marginBottom: "13px",
      border: "1px solid #d5d8e2",
      borderRadius: "7px",
      boxSizing: "border-box"
    },
    label: {
      fontWeight: "bold",
      fontSize: "14px"
    }
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>🎨 CreativeKids</div>
        <h3>Parent Menu</h3>

        <Link to="/parent-dashboard" style={styles.sideLink}>
          🏠 Dashboard
        </Link>

        <Link to="/upload" style={styles.sideLink}>
          🎨 Upload Artwork
        </Link>

        <Link to="/" style={styles.sideLink}>
          🖼️ View Gallery
        </Link>

        <Link to="/" style={styles.sideLink}>
          ← Back to Home
        </Link>
      </aside>

      <main style={styles.main}>
        <section style={styles.welcome}>
          <h1>Parent Dashboard</h1>
          <h2>Welcome, {parent.name || "Parent"}! 👋</h2>
          <p style={styles.muted}>
            Manage your CreativeKids account and explore artwork.
          </p>
        </section>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>🎨 My Artworks</h3>
            <div style={styles.number}>
              {loading ? "..." : artworks.length}
            </div>
            <p style={styles.muted}>Your uploaded artworks</p>
          </div>

          <div style={styles.card}>
            <h3>👤 Parent Profile</h3>
            <p><strong>{parent.name || "Not available"}</strong></p>
            <p style={styles.muted}>
              {parent.email || "Not available"}
            </p>
          </div>

          <div style={styles.card}>
            <h3>✨ Creative Community</h3>
            <div style={styles.number}>Welcome!</div>
            <p style={styles.muted}>Explore young artists' work</p>
          </div>
        </div>

        <section style={styles.section}>
          <h2>Quick Actions</h2>
          <p style={styles.muted}>What would you like to do today?</p>

          <Link to="/upload" style={styles.actionLink}>
            + Upload Artwork
          </Link>

          <Link to="/" style={styles.actionLink}>
            View Gallery
          </Link>
        </section>

        <section style={styles.section}>
          <h2>My Recent Artworks</h2>
          <p style={styles.muted}>
            Artworks uploaded through your parent account.
          </p>

          {message && (
            <p role="status" style={{ color: "green" }}>
              {message}
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: "#b42318" }}>
              {error}
            </p>
          )}

          {loading ? (
            <p>Loading your artworks...</p>
          ) : artworks.length === 0 ? (
            <p>
              You haven't uploaded any artworks with this account yet.
              <br />
              <Link to="/upload">Upload your first artwork</Link>
            </p>
          ) : (
            artworks.slice(0, 5).map((art, index) => (
              <div
                key={art.id || art._id || index}
                style={styles.artwork}
              >
                <strong>{art.title || "Untitled Artwork"}</strong>

                {art.image && (
                  <img
                    src={art.image}
                    alt={art.title || "Artwork"}
                    style={styles.artworkImage}
                  />
                )}

                {editingId === art.id ? (
                  <div style={{ marginTop: "15px" }}>
                    <label style={styles.label}>Artwork Title</label>
                    <input
                      style={styles.input}
                      name="title"
                      value={editForm.title}
                      onChange={handleFormChange}
                      maxLength={100}
                      required
                    />

                    <label style={styles.label}>Artist Name</label>
                    <input
                      style={styles.input}
                      name="artist"
                      value={editForm.artist}
                      onChange={handleFormChange}
                      maxLength={60}
                      required
                    />

                    <label style={styles.label}>Category</label>
                    <select
                      style={styles.input}
                      name="category"
                      value={editForm.category}
                      onChange={handleFormChange}
                    >
                      <option value="Drawing">Drawing</option>
                      <option value="Painting">Painting</option>
                      <option value="Craft">Craft</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Other">Other</option>
                    </select>

                    <button
                      type="button"
                      style={styles.editButton}
                      disabled={saving}
                      onClick={() => handleSave(art)}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      style={styles.deleteButton}
                      disabled={saving}
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={styles.muted}>
                      Artist: {art.artist || "Unknown"}
                      {" | "}
                      Category: {art.category || "Other"}
                    </p>

                    <button
                      type="button"
                      style={styles.editButton}
                      disabled={deletingId !== null || saving}
                      onClick={() => startEditing(art)}
                    >
                      ✏️ Edit Artwork
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.deleteButton,
                        opacity: deletingId === art.id ? 0.6 : 1
                      }}
                      disabled={deletingId !== null || saving}
                      onClick={() => handleDelete(art)}
                    >
                      {deletingId === art.id
                        ? "Deleting..."
                        : "🗑️ Delete Artwork"}
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </section>

        <p style={styles.muted}>
          © 2026 CreativeKids. Made for little artists and their families.
        </p>
      </main>
    </div>
  );
}

export default ParentDashboard;
