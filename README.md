# 🎮 Recomendador de Jogos por Humor

## 👤 Autor
**Tiago Braga**

---

## 🧠 Tema
Aplicação web interativa que recomenda jogos baseados no humor e desejo do utilizador.

---

## 💡 Ideia da Funcionalidade e da Interface

O utilizador descreve como está a sentir-se e o que gostaria de jogar. A aplicação interpreta essa entrada com ajuda de uma API de IA, classifica o humor, altera a "mood" do site consoante a classificação e sugere géneros de jogos compatíveis com o estado emocional do utilizador.

A interface apresenta:
- Um campo de texto para o utilizador escrever como se sente.
- Um botão para gerar recomendações.
- Um fundo dinâmico com cores e transições suaves que refletem o humor identificado.
- Recomendações de jogos disponíveis na api IMDB, com links para visualizar os detalhes mais específicos do jogo no site do IMDB.

---

## 🌐 Web APIs Utilizadas

- **[OpenRouter.ai](https://openrouter.ai/)**: API compatível com OpenAI usada para interpretar o texto do utilizador e devolver o humor, objetivo emocional e géneros de jogo sugeridos.
- **[IMDB](https://api-docs.igdb.com/#getting-started/)**: API de jogos.
- **[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)**: Para fazer chamadas HTTP do frontend para o backend e para a API da IA.
- **[Node.js + Express](https://expressjs.com/)**: Backend leve para servir os ficheiros estáticos e fazer proxy das chamadas à API de IA com segurança (escondendo a chave de API).

---
