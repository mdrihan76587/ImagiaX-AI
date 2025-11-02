import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

// Upscale endpoint
app.post("/upscale", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    const imagePath = req.file.path;

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: fs.createReadStream(imagePath),
    });

    const buffer = await response.buffer();
    fs.unlinkSync(imagePath);

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
