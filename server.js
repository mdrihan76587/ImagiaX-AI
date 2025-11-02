const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
const RUNWARE_API_URL = "https://api.runware.io/v1/upscale"; // Runware image upscale endpoint

app.post("/upscale", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    const formData = new FormData();
    formData.append("image", fs.createReadStream(file.path));

    const response = await fetch(RUNWARE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWARE_API_KEY}`
      },
      body: formData
    });

    const buffer = await response.buffer();
    fs.unlinkSync(file.path);

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Runware API Error:", err);
    res.status(500).send("Error processing image with Runware API");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
