const submitBtn = document.getElementById("submitBtn");
const userInput = document.getElementById("userInput");
const loading = document.getElementById("loading");
const results = document.getElementById("results");

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


let currentBg = 1;

function updateBackgroundByMood(mood) {
  const gradients = {
    calm: "linear-gradient(to right, #3a6073, #16222a)",
    relaxed: "linear-gradient(to right, #3a6073, #16222a)",
    anxious: "linear-gradient(to right, #a40606, #d98324)",
    angry: "linear-gradient(to right, #a40606, #d98324)",
    happy: "linear-gradient(to right, #f7971e, #ffd200)",
    excited: "linear-gradient(to right, #f7971e, #ffd200)",
    sad: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    default: "linear-gradient(to right, #141e30, #243b55)"
  };

  const gradient = gradients[mood.toLowerCase()] || gradients.default;

  const bg1 = document.getElementById("background1");
  const bg2 = document.getElementById("background2");

  if (currentBg === 1) {
    bg2.style.background = gradient;
    bg2.style.opacity = 1;
    bg1.style.opacity = 0;
    currentBg = 2;
  } else {
    bg1.style.background = gradient;
    bg1.style.opacity = 1;
    bg2.style.opacity = 0;
    currentBg = 1;
  }
}


async function getGenresFromAI(userText) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: userText })
  });

  const result = await response.json();
  let content = result.choices?.[0]?.message?.content || "{}";
  content = content.replace(/```json|```/g, '').trim();

  console.log(content);

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Parse error:", e);
    return {
      mood: "neutral",
      desired_feeling: "fun",
      recommended_genres: ["casual"]
    };
  }
}

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