// server/routes/upload.js
import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Endpoint upload image (generik)
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const filePath = `/uploads/${req.file.filename}`;
  const url = `${req.protocol}://${req.get("host")}${filePath}`;
  res.json({ message: "Upload success", filePath, url });
});


export default router;
