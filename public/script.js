const submitBtn = document.getElementById("submitBtn");
const userInput = document.getElementById("userInput");
const loading = document.getElementById("loading");
const results = document.getElementById("results");
const pagination = document.getElementById("pagination");

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

let lastInputText = "";

async function loadGames(input, page = 0) {
  lastInputText = input;

  results.innerHTML = "";
  loading.style.display = "flex"; // show spinner

  const response = await fetch(`/api/ai?page=${page}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input })
  });

  const { mood, genres, games } = await response.json();
  updateBackgroundByMood(mood || "neutral");

  if (!games || games.length === 0) {
    results.innerHTML = "<p>No matching games found.</p>";
  } else {
    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      const cover = game.cover?.url
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
        : "https://via.placeholder.com/264x374?text=No+Image";

      card.innerHTML = `
        <h3>${game.name}</h3>
        <img src="${cover}" alt="${game.name}" />
        <p>${game.summary || "No description available."}</p>
        <a href="https://www.igdb.com/games/${game.slug}" target="_blank">View on IGDB</a>
      `;
      results.appendChild(card);
    });

    showPaginationControls(page);
  }

  loading.style.display = "none";  // hide spinner
}

submitBtn.addEventListener("click", () => {
  const input = userInput.value.trim();
  if (input) { 
    loadGames(input, 0);
    pagination.innerHTML = "";
  }
});

function showPaginationControls(currentPage, totalPages = 5) {
  pagination.innerHTML = "";

  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = (i === currentPage) ? "active" : "";
    btn.onclick = () => loadGames(lastInputText, i);
    pagination.appendChild(btn);
  }
}

