import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let IGDB_ACCESS_TOKEN = "";

// Get OAuth token from Twitch for IGDB
async function getIGDBToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    IGDB_ACCESS_TOKEN = data.access_token;
    console.log("✅ IGDB Access Token obtained.");
  } catch (error) {
    console.error("❌ Failed to get IGDB token:", error);
  }
}

await getIGDBToken();

// Genre name → IGDB genre ID map
const genreMap = {
  "shooter": 5,
  "racing": 10,
  "adventure": 31,
  "puzzle": 9,
  "indie": 32,
  "fighting": 4,
  "platformer": 8,
  "strategy": 11,
  "role-playing": 12,
  "sports": 14,
  "simulator": 13,
  "casual": 33,
  "arcade": 33,
  "funny": 33,
  "horror": 34
};

function getGenreIDs(genres) {
  return genres
    .map(g => genreMap[g.toLowerCase()])
    .filter(id => id !== undefined);
}

// 🧠 Main AI + IGDB route
app.post("/api/ai", async (req, res) => {
  const userText = req.body.text;

  console.log("📩 User Input:", userText);

  const prompt = `
  You are a video game genre assistant.

  Your task is to:
  1. Read the user's input — which may be in any language and include their emotions and what type of game they feel like playing.
  2. If the input is not in English, **translate it** first.
  3. Extract:
    - Their mood (emotion): e.g. happy, calm, excited, frustrated
    - Their desired emotional experience: e.g. thrill, relaxation, focus, adrenaline, creativity
    - 2–3 **real** video game genres that best match what they want (e.g. simulation, racing, puzzle)
  4. Avoid vague genres like "arcade" or "cool" unless the user explicitly says them.
  5. Be creative but **accurate and practical** — return genres that can be queried from a database.
  6. Respond ONLY in this exact JSON format, no other text:

  {
    "mood": "...",
    "desired_feeling": "...",
    "recommended_genres": ["...", "..."]
  }

  User input: "${userText}"
  `;


  try {
    // Call OpenRouter (AI)

    console.log("🔑 Using API key:", process.env.OPENROUTER_API_KEY);
    
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,  // higher = more diverse
        top_p: 0.9,
        max_tokens: 400
      })
    });

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";

    console.log("🤖 AI Raw Response:", aiData);

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    console.log("🎯 Parsed:", parsed);

    const genreIDs = getGenreIDs(parsed.recommended_genres || []);

    console.log("🧩 IGDB Genre IDs:", genreIDs);

    if (genreIDs.length === 0) {
      return res.status(200).json({
        mood: parsed.mood,
        genres: parsed.recommended_genres,
        games: []
      });
    }

    // Fetch games from IGDB
    const randomOffset = Math.floor(Math.random() * 100); // 100 to 200+ for wider variety

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${IGDB_ACCESS_TOKEN}`
      },
      body: `
        fields name, summary, cover.url, genres.name, url, slug, rating, first_release_date;
        where genres = (${genreIDs.join(",")})
          & cover != null
          & rating != null
          & rating > 60
          & first_release_date != null;
        sort rating desc;
        limit 10;
        offset ${randomOffset};
      `
    });

    const games = await igdbRes.json();

    console.log("🎮 IGDB Games:", games);

    res.json({
      mood: parsed.mood,
      genres: parsed.recommended_genres,
      games
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
