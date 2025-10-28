import express from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ CORS handled for all origins
app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Api-Key"]
}));

// Environment variables
const PORT = process.env.PORT || 10000;
const AI_GEN_API_KEY = process.env.AI_GEN_API_KEY;
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
const UPSCALE_API_KEY = process.env.UPSCALE_API_KEY;

const AI_GEN_ENDPOINT = process.env.AI_GEN_ENDPOINT;
const REMOVE_BG_ENDPOINT = process.env.REMOVE_BG_ENDPOINT;
const UPSCALE_ENDPOINT = process.env.UPSCALE_ENDPOINT;

// --- 1) AI Image Generation ---
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Provide prompt in body" });

    const response = await fetch(AI_GEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_GEN_API_KEY}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("AI generate error:", response.status, txt);
      return res.status(500).json({ error: "AI generate failed", detail: txt });
    }

    const data = await response.json();
    if (!data.url && !data.image_url) {
      console.error("No image_url returned from AI provider", data);
      return res.status(500).json({ error: "No image_url returned", raw: data });
    }

    return res.json({ image_url: data.url || data.image_url });
  } catch (err) {
    console.error("AI generate failed:", err);
    return res.status(500).json({ error: "AI generate failed", detail: err.message });
  }
});

// --- 2) Remove Background ---
app.post("/api/remove-bg", async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: "Provide image_url in body" });

    const form = new FormData();
    form.append("image_url", image_url);

    const r = await fetch(REMOVE_BG_ENDPOINT, {
      method: "POST",
      headers: { "X-Api-Key": REMOVE_BG_API_KEY },
      body: form
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Remove-bg error:", r.status, txt);
      return res.status(500).json({ error: "Remove-bg failed", detail: txt });
    }

    const data = await r.json();
    if (!data.result_url && !data.url) {
      console.error("No result_url returned from remove-bg", data);
      return res.status(500).json({ error: "No result_url returned", raw: data });
    }

    return res.json({ image_url: data.result_url || data.url });
  } catch (err) {
    console.error("Remove-bg failed:", err);
    return res.status(500).json({ error: "Remove-bg failed", detail: err.message });
  }
});

// --- 3) Upscale ---
app.post("/api/upscale", async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: "Provide image_url in body" });

    const form = new FormData();
    form.append("file", image_url); // Cloudinary uses 'file'

    const r = await fetch(UPSCALE_ENDPOINT, {
      method: "POST",
      headers: { "Authorization": `Bearer ${UPSCALE_API_KEY}` },
      body: form
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Upscale error:", r.status, txt);
      return res.status(500).json({ error: "Upscale API error", detail: txt });
    }

    const data = await r.json();
    const out = data.secure_url || data.url;
    if (!out) return res.status(500).json({ error: "No upscale URL returned", raw: data });

    return res.json({ image_url: out });
  } catch (err) {
    console.error("Upscale failed:", err);
    return res.status(500).json({ error: "Upscale failed", detail: err.message });
  }
});

// --- Root / Health check ---
app.get("/", (req, res) => res.send("ImagiaX AI Backend is running"));

// --- Start server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
