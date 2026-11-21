import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/search", async (req, res) => {
  const { origin, destination, date, modes } = req.body || {};
  if (!origin || !destination || !date || !Array.isArray(modes)) {
    return res.status(400).json({ error: "Please provide origin, destination, date, and transport modes." });
  }

  /*
    LIVE-DATA INTEGRATION POINT
    Connect licensed/provider APIs here (flight, rail, bus, ferry where available).
    Normalize every provider response into the schema used by public/app.js:
      {
        id, mode, title, legs: [{from,to,departure,arrival,operator,bookingUrl}],
        durationMinutes, totalPrice, currency, availability, source, checkedAt,
        fareType: "live" | "estimate"
      }
    Keep API keys in server environment variables. Do not scrape sites against their
    terms or invent prices/times. AI can summarize and compare returned provider data,
    but should not be treated as the source of fares or schedules.
  */

  return res.status(501).json({
    error: "Live travel sources are not connected yet.",
    explanation: "The app shell is ready, but real fares and schedules require provider API access and server-side credentials. This demo deliberately does not invent live results.",
    setup: [
      "Choose flight, rail, and bus data providers that cover your routes.",
      "Add their credentials to the server environment (not the iPhone app).",
      "Implement provider adapters in this endpoint and normalize their results.",
      "Optionally connect an AI model to explain and rank verified provider results."
    ]
  });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(port, () => console.log(`GoAnywhere running on http://localhost:${port}`));
