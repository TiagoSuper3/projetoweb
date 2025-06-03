const submitBtn = document.getElementById("submitBtn");
const userInput = document.getElementById("userInput");
const loading = document.getElementById("loading");
const results = document.getElementById("results");

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

async function getGamesFromAI(userText) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: userText })
  });

  const result = await response.json();
  return result;
}

submitBtn.addEventListener("click", async () => {
  const input = userInput.value.trim();
  if (!input) return;

  results.innerHTML = "";
  loading.classList.remove("hidden");

  const { mood, genres, games } = await getGamesFromAI(input);

  updateBackgroundByMood(mood || "neutral");

  if (!games || games.length === 0) {
    results.innerHTML = "<p>No matching games found. Try a different mood!</p>";
  } else {
    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";

      const cover = game.cover?.url
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
        : "https://via.placeholder.com/264x374?text=No+Image";

      const slug = game.slug || game.name.toLowerCase().replace(/\s+/g, "-");

      card.innerHTML = `
        <h3>${game.name}</h3>
        <img src="${cover}" alt="${game.name}" />
        <p>${game.summary || "No description available."}</p>
        <a href="https://www.igdb.com/games/${slug}" target="_blank">View on IGDB</a>
      `;

      results.appendChild(card);
    });
  }

  loading.classList.add("hidden");
});
