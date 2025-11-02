const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

// Upscale endpoint
app.post("/upscale", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.RUNWARE_API_KEY;
    const imagePath = req.file.path;

    const response = await fetch("https://api.runware.ai/v1/upscale", {
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
