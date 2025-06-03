const submitBtn = document.getElementById("submitBtn");
const userInput = document.getElementById("userInput");
const loading = document.getElementById("loading");
const results = document.getElementById("results");

// Game library
const gameLibrary = [
  {
    title: "Calm Puzzle",
    genres: ["relaxing", "puzzle", "casual"],
    iframe: "https://poki.com/embed/game/twenty48-solitaire"
  },
  {
    title: "Fast Action Game",
    genres: ["fast", "action", "arcade"],
    iframe: "https://poki.com/embed/game/stickman-hook"
  },
  {
    title: "Funny Stress Relief",
    genres: ["funny", "casual", "stress relief"],
    iframe: "https://poki.com/embed/game/elastic-man"
  }
];

// 🌈 Mood-based background
function updateBackgroundByMood(mood) {
  const root = document.body;
  let color;

  switch (mood.toLowerCase()) {
    case "calm":
    case "relaxed":
      color = "linear-gradient(to right, #3a6073, #16222a)";
      break;
    case "anxious":
    case "angry":
      color = "linear-gradient(to right, #a40606, #d98324)";
      break;
    case "happy":
    case "excited":
      color = "linear-gradient(to right, #f7971e, #ffd200)";
      break;
    default:
      color = "linear-gradient(to right, #141e30, #243b55)";
  }

  root.style.background = color;
}

// 🧠 Call TextCortex API
async function getGenresFromAI(userText) {
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

  try {
    const response = await fetch("https://api.textcortex.com/v1/texts/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY" // 🔁 Replace this safely
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 100,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("AI error:", err);
    return {
      mood: "neutral",
      desired_feeling: "fun",
      recommended_genres: ["casual"]
    };
  }
}

// 🚀 Main button handler
submitBtn.addEventListener("click", async () => {
  const input = userInput.value.trim();
  if (!input) return;

  results.innerHTML = "";
  loading.classList.remove("hidden");

  const result = await getGenresFromAI(input);
  const recommendedGenres = result.recommended_genres || [];

  updateBackgroundByMood(result.mood || "neutral");

  const matchedGames = gameLibrary.filter(game =>
    game.genres.some(g => recommendedGenres.includes(g))
  );

  if (matchedGames.length === 0) {
    results.innerHTML = "<p>No matching games found. Try a different mood!</p>";
  } else {
    matchedGames.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `
        <h3>${game.title}</h3>
        <iframe src="${game.iframe}" loading="lazy"></iframe>
      `;
      results.appendChild(card);
    });
  }

  loading.classList.add("hidden");
});
