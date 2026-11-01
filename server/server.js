
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the CreativeKids Backend!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CreativeKids server is running!"
  });
});

app.listen(PORT, () => {
  console.log(`CreativeKids backend running at http://localhost:${PORT}`);
});
