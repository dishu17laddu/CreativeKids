
import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

const MY_ARTWORKS_URL =
  "https://creativekids.onrender.com/api/my-artworks";

function getArtworkList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.artworks)) return data.artworks;
  if (Array.isArray(data?.myArtworks)) return data.myArtworks;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.artworks)) return data.data.artworks;
  if (Array.isArray(data?.data?.myArtworks)) return data.data.myArtworks;
  return [];
}

function ParentDashboard() {
  const navigate = useNavigate();

  const [myArtworks, setMyArtworks] = useState([]);
  const [parentName, setParentName] = useState("Parent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("parentToken");

  useEffect(() => {
    try {
      const savedParent = JSON.parse(
        localStorage.getItem("parentInfo") || "{}"
      );
      setParentName(savedParent.name || "Parent");
    } catch {
      setParentName("Parent");
    }

    async function loadMyArtworks() {
      const currentToken = localStorage.getItem("parentToken");

      if (!currentToken) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(MY_ARTWORKS_URL, {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your artworks."
          );
        }

        setMyArtworks(getArtworkList(data));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadMyArtworks();
  }, []);

  function handleLogout() {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parentInfo");
    navigate("/login", { replace: true });
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link className="logo" to="/">
          🎨 CreativeKids
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload Artwork</Link>
        </div>

        <button className="login-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main style={{ padding: "40px 5%", minHeight: "70vh" }}>
        <h1>Parent Dashboard</h1>

        <p>Welcome, {parentName}!</p>
        <p>Manage and view your uploaded artworks here.</p>

        <div
          style={{
            background: "#eef4ff",
            padding: "20px",
            borderRadius: "12px",
            margin: "25px 0"
          }}
        >
          <h2>My Artworks: {myArtworks.length}</h2>
          <Link to="/upload" className="primary-btn">
            + Upload New Artwork
          </Link>
        </div>

        {loading && <p>Loading your artworks...</p>}

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div
            className="art-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >
            {myArtworks.map((art) => (
              <article
                className="art-card"
                key={String(art.id ?? art._id)}
              >
                {art.image && (
                  <img
                    src={art.image}
                    alt={art.title || "Artwork"}
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      objectFit: "cover"
                    }}
                  />
                )}

                <div className="art-info">
                  <span className="category">
                    {art.category || "Drawing"}
                  </span>
                  <h3>{art.title}</h3>
                  <p>Artist: {art.artist}</p>
                </div>
              </article>
            ))}

            {myArtworks.length === 0 && (
              <p>You have not uploaded any artwork yet.</p>
            )}
          </div>
        )}

        <p style={{ marginTop: "30px" }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </main>
    </div>
  );
}

export default ParentDashboard;
