
import ParentDashboard from "./ParentDashboard";
import ParentRegister from "./ParentRegister";
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import "./App.css";
import ParentLogin from "./ParentLogin.jsx";
import ArtworkUpload from "./ArtworkUpload.jsx";

const API_URL = "https://creativekids.onrender.com/api/artworks";
const MY_ARTWORKS_URL = "https://creativekids.onrender.com/api/my-artworks";

function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem("parentToken");

  if (!token) {
    throw new Error("Please log in as a parent before continuing.");
  }

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`
  };
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The server request failed.");
  }

  return data;
}

// Supports different response formats from the backend.
function getArtworkList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.artworks)) return data.artworks;
  if (Array.isArray(data?.myArtworks)) return data.myArtworks;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.artworks)) return data.data.artworks;
  if (Array.isArray(data?.data?.myArtworks)) return data.data.myArtworks;

  return [];
}

function getArtworkId(art) {
  return art?.id ?? art?._id;
}

const styles = {
  editButton: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#eef4ff",
    color: "#234ea5",
    border: "1px solid #c4d5ff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  deleteButton: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#fff0f0",
    color: "#b42318",
    border: "1px solid #f3b5b5",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  editForm: {
    marginTop: "15px",
    padding: "15px",
    background: "#f8faff",
    border: "1px solid #dbe4f0",
    borderRadius: "10px"
  },
  label: {
    display: "block",
    marginTop: "12px",
    fontWeight: "600",
    fontSize: "14px"
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccd4df",
    borderRadius: "6px",
    fontSize: "14px"
  },
  saveButton: {
    display: "block",
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    background: "#18794e",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  cancelButton: {
    display: "block",
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    background: "#e8ebf0",
    color: "#333",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

function HomePage({
  artworks,
  ownedArtworkIds,
  loading,
  error,
  isLoggedIn,
  onLogout,
  onDeleteArtwork,
  onEditArtwork
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [liked, setLiked] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    category: "Drawing"
  });

  const safeArtworks = Array.isArray(artworks) ? artworks : [];

  const categories = [
    "All",
    ...new Set(
      safeArtworks
        .map((art) => art.category || "Drawing")
        .filter(Boolean)
    )
  ];

  const filteredArtworks = safeArtworks.filter((art) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      `${art.title || ""} ${art.artist || ""}`
        .toLowerCase()
        .includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      (art.category || "Drawing") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
  }

  function startEditing(art) {
    const artId = String(getArtworkId(art));

    if (!ownedArtworkIds.has(artId)) {
      alert("You can only edit your own artwork.");
      return;
    }

    setEditingId(getArtworkId(art));

    setEditForm({
      title: art.title || "",
      artist: art.artist || "",
      category: art.category || "Drawing"
    });
  }

  async function saveEditing(event) {
    event.preventDefault();

    const title = editForm.title.trim();
    const artist = editForm.artist.trim();

    if (!title || !artist) {
      alert("Please enter both the artwork title and artist name.");
      return;
    }

    try {
      await onEditArtwork(editingId, {
        title,
        artist,
        category: editForm.category
      });

      setEditingId(null);
      alert("Artwork updated successfully!");
    } catch (err) {
      alert(err.message || "Could not update artwork.");
    }
  }

  async function handleDelete(art) {
    const artId = getArtworkId(art);

    if (!ownedArtworkIds.has(String(artId))) {
      alert("You can only delete your own artwork.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${art.title}"?`)) {
      return;
    }

    try {
      await onDeleteArtwork(artId);

      setLiked((previous) =>
        previous.filter((id) => String(id) !== String(artId))
      );

      if (String(editingId) === String(artId)) {
        setEditingId(null);
      }
    } catch (err) {
      alert(err.message || "Could not delete artwork.");
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link className="logo" to="/">
          🎨 CreativeKids
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="/#gallery">Gallery</a>
          <Link to="/upload">Upload Artwork</Link>
          <a href="/#community">Community</a>
          <a href="/#about">About</a>
        </div>

        {isLoggedIn ? (
          <>
            <Link className="login-btn" to="/parent-dashboard">
              Dashboard
            </Link>

            <button
              type="button"
              className="login-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link className="login-btn" to="/login">
            Parent Login
          </Link>
        )}
      </nav>

      <header className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">A HAPPY PLACE FOR LITTLE ARTISTS</p>

          <h1>
            Every Child Is An <span>Artist!</span>
          </h1>

          <p className="hero-text">
            A safe and joyful space where children share their creativity
            and parents celebrate every little masterpiece.
          </p>

          <a className="primary-btn" href="#gallery">
            Explore Artwork →
          </a>

          <Link
            className="primary-btn"
            to="/upload"
            style={{
              display: "inline-block",
              marginLeft: "10px",
              textDecoration: "none"
            }}
          >
            Upload Your Art 🎨
          </Link>
        </div>

        <div className="hero-art" aria-label="Art and painting">
          🎨🖌️
        </div>
      </header>

      <main>
        <section className="gallery section" id="gallery">
          <p className="tagline">MADE WITH LOVE</p>

          <h2>Little Hands, Big Ideas ✨</h2>

          <p className="section-text">
            Discover colourful artwork and creative ideas.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              margin: "25px 0"
            }}
          >
            <input
              className="search"
              type="text"
              placeholder="Search by artwork title or artist..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                minWidth: "250px",
                maxWidth: "100%",
                boxSizing: "border-box"
              }}
            />

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                minWidth: "150px",
                background: "white"
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: "12px 18px",
                background: "#234ea5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Clear Filters
            </button>
          </div>

          {loading && <p>Loading artworks from the server...</p>}

          {error && <p role="alert">{error}</p>}

          <div className="art-grid">
            {filteredArtworks.map((art) => {
              const artId = getArtworkId(art);
              const isOwner =
                isLoggedIn && ownedArtworkIds.has(String(artId));

              return (
                <article className="art-card" key={String(artId)}>
                  {art.image ? (
                    <img
                      src={art.image}
                      alt={art.title || "Artwork"}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ padding: "40px", fontSize: "48px" }}>
                      🎨
                    </div>
                  )}

                  <div className="art-info">
                    <span className="category">
                      {art.category || "Drawing"}
                    </span>

                    <h3>{art.title}</h3>
                    <p>{art.artist}</p>

                    <button
                      type="button"
                      className="like-btn"
                      onClick={() =>
                        setLiked((previous) =>
                          previous.includes(artId)
                            ? previous.filter(
                                (id) => String(id) !== String(artId)
                              )
                            : [...previous, artId]
                        )
                      }
                    >
                      {liked.some((id) => String(id) === String(artId))
                        ? "♥ Appreciated"
                        : "♡ Appreciate"}
                    </button>

                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(art)}
                          style={styles.editButton}
                        >
                          ✏️ Edit Artwork
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(art)}
                          style={styles.deleteButton}
                        >
                          🗑️ Delete Artwork
                        </button>
                      </>
                    )}

                    {isOwner &&
                      String(editingId) === String(artId) && (
                        <form
                          onSubmit={saveEditing}
                          style={styles.editForm}
                        >
                          <h3>Edit Your Artwork</h3>

                          <label style={styles.label}>
                            Artwork Title
                            <input
                              style={styles.input}
                              value={editForm.title}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  title: event.target.value
                                })
                              }
                              required
                            />
                          </label>

                          <label style={styles.label}>
                            Artist Name
                            <input
                              style={styles.input}
                              value={editForm.artist}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  artist: event.target.value
                                })
                              }
                              required
                            />
                          </label>

                          <label style={styles.label}>
                            Category
                            <select
                              style={styles.input}
                              value={editForm.category}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  category: event.target.value
                                })
                              }
                            >
                              <option>Drawing</option>
                              <option>Painting</option>
                              <option>Nature</option>
                              <option>Craft</option>
                              <option>Other</option>
                            </select>
                          </label>

                          <button type="submit" style={styles.saveButton}>
                            💾 Save Changes
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                  </div>
                </article>
              );
            })}

            {!loading && !error && filteredArtworks.length === 0 && (
              <p>
                {search.trim() || selectedCategory !== "All"
                  ? "No artwork found. Try changing your search or category."
                  : "No artwork has been uploaded yet. Be the first!"}
              </p>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Link
              to="/upload"
              className="primary-btn"
              style={{ textDecoration: "none" }}
            >
              Add Your Artwork →
            </Link>
          </div>
        </section>

        <section className="community" id="community">
          <div>
            <p className="tagline">GROW TOGETHER</p>

            <h2>A Community for Parents 💛</h2>

            <p>
              Share creative ideas, celebrate achievements, and learn
              together in a supportive parent community.
            </p>

            <button
              className="primary-btn"
              onClick={() => alert("Parent community will be added later!")}
            >
              Join the Community →
            </button>
          </div>

          <div className="community-icon">👨‍👩‍👧‍👦</div>
        </section>

        <section className="about section" id="about">
          <h2>Creativity Deserves to Shine!</h2>

          <p>
            Our goal is to encourage children's imagination and provide
            a parent-managed, safe and moderated environment.
          </p>
        </section>
      </main>

      <footer>
        <h3>🎨 CreativeKids</h3>
        <p>Made for little artists, supported by parents.</p>
        <p>© 2026 CreativeKids. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  const [artworks, setArtworks] = useState([]);
  const [ownedArtworkIds, setOwnedArtworkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("parentToken"))
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Keep login status updated after login, logout, or browser storage changes.
  useEffect(() => {
    function updateLoginStatus() {
      setIsLoggedIn(Boolean(localStorage.getItem("parentToken")));
    }

    updateLoginStatus();

    window.addEventListener("storage", updateLoginStatus);

    return () => {
      window.removeEventListener("storage", updateLoginStatus);
    };
  }, [location.pathname]);

  // Load only the artwork belonging to the currently logged-in parent.
  async function loadMyArtworks() {
    const token = localStorage.getItem("parentToken");

    if (!token) {
      setOwnedArtworkIds(new Set());
      return;
    }

    try {
      const response = await fetch(MY_ARTWORKS_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await readResponse(response);
      const myArtworks = getArtworkList(data);

      console.log("My artworks received:", myArtworks);

      const ids = myArtworks
        .map((art) => getArtworkId(art))
        .filter((id) => id !== undefined && id !== null)
        .map((id) => String(id));

      setOwnedArtworkIds(new Set(ids));
    } catch (err) {
      setOwnedArtworkIds(new Set());
      console.error("Could not load owned artworks:", err.message);
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadMyArtworks();
    } else {
      setOwnedArtworkIds(new Set());
    }
  }, [isLoggedIn, location.pathname]);

  // Load all public artworks for the gallery.
  async function loadArtworks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await readResponse(response);
      const list = getArtworkList(data);

      setArtworks(list);
      console.log("Public artworks received:", list.length);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check that the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArtworks();
  }, []);

  function logout() {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parentInfo");

    setIsLoggedIn(false);
    setOwnedArtworkIds(new Set());

    navigate("/login");

    alert("You have been logged out successfully.");
  }

  // Add new artwork.
  async function addArtwork(newArtwork) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(newArtwork)
    });

    const data = await readResponse(response);
    const createdArtwork = data.artwork || data.data?.artwork || data;

    setArtworks((previous) => [createdArtwork, ...previous]);

    const newId = getArtworkId(createdArtwork);

    if (newId !== undefined && newId !== null) {
      setOwnedArtworkIds((previous) => {
        const updated = new Set(previous);
        updated.add(String(newId));
        return updated;
      });
    }
  }

  // Edit artwork. The backend checks ownership again.
  async function editArtwork(id, changes) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(changes)
      }
    );

    const data = await readResponse(response);
    const updatedArtwork = data.artwork || data.data?.artwork || data;

    setArtworks((previous) =>
      previous.map((art) =>
        String(getArtworkId(art)) === String(id)
          ? updatedArtwork
          : art
      )
    );
  }

  // Delete artwork. The backend checks ownership again.
  async function deleteArtwork(id) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders()
      }
    );

    await readResponse(response);

    setArtworks((previous) =>
      previous.filter(
        (art) => String(getArtworkId(art)) !== String(id)
      )
    );

    setOwnedArtworkIds((previous) => {
      const updated = new Set(previous);
      updated.delete(String(id));
      return updated;
    });
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            artworks={artworks}
            ownedArtworkIds={ownedArtworkIds}
            loading={loading}
            error={error}
            isLoggedIn={isLoggedIn}
            onLogout={logout}
            onDeleteArtwork={deleteArtwork}
            onEditArtwork={editArtwork}
          />
        }
      />

      <Route path="/login" element={<ParentLogin />} />

      <Route
        path="/parent-register"
        element={<ParentRegister />}
      />

      <Route
        path="/upload"
        element={<ArtworkUpload onArtworkAdded={addArtwork} />}
      />

      <Route
        path="/parent-dashboard"
        element={
          isLoggedIn ? (
            <ParentDashboard artworks={artworks} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
