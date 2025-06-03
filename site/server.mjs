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

app.post("/api/ai", async (req, res) => {
  const userText = req.body.text;

  const prompt = `
  User said: "${userText}"
  What is their mood, what do they want to feel, and what genres of games would match?
  Respond with JSON like:
  {
    "mood": "...",
    "desired_feeling": "...",
    "recommended_genres": ["...", "..."]
  }
  `;

  console.log(prompt);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({  
        model: "gpt-4o", // Or any model listed in the error
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await response.json();

    console.log(data);

    res.json(data);
  } catch (error) {
    console.error("Error calling AI:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
