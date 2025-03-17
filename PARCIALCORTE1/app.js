const publicKey = "750dad3c69f7f60ff994e1d0cffed08d";
const privateKey = "4627841960d8e857d2c29e119573b04d68817d63";
const ts = 1;

function generateHash(ts, privateKey, publicKey) {
  return CryptoJS.MD5(ts + privateKey + publicKey).toString();
}

const hash = generateHash(ts, privateKey, publicKey);

const searchInput = document.getElementById("searchInput");
const comicsContainer = document.getElementById("comicsContainer");
const errorMessage = document.getElementById("errorMessage");

async function fetchCharacter(name) {
  const url = `https://gateway.marvel.com/v1/public/characters?name=${name}&apikey=${publicKey}&ts=${ts}&hash=${hash}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al conectar con la API.");
    }
    const data = await response.json();

    if (data.data.results.length > 0) {
      return data.data.results[0];
    } else {
      throw new Error("Personaje no encontrado.");
    }
  } catch (error) {
    throw new Error(error.message || "Error desconocido.");
  }
}

async function fetchComics(characterId) {
  const url = `https://gateway.marvel.com/v1/public/characters/${characterId}/comics?apikey=${publicKey}&ts=${ts}&hash=${hash}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al conectar con la API.");
    }
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    throw new Error(error.message || "Error desconocido.");
  }
}

function displayComics(comics) {
  comicsContainer.innerHTML = "";
  comics.forEach(comic => {
    const comicUrl = comic.urls && comic.urls.length > 0 ? comic.urls[0].url : "#";

    const comicElement = document.createElement("div");
    comicElement.classList.add("comic");
    comicElement.innerHTML = `
      <a href="${comicUrl}" target="_blank" rel="noopener noreferrer">
        <img src="${comic.thumbnail.path}.${comic.thumbnail.extension}" alt="${comic.title}">
        <h3>${comic.title}</h3>
      </a>
    `;
    comicsContainer.appendChild(comicElement);
  });
}

async function searchComics() {
  const characterName = searchInput.value.trim();
  if (!characterName) {
    errorMessage.textContent = "Escribe el nombre de tu personaje favorito.";
    return;
  }

  errorMessage.textContent = "";
  comicsContainer.innerHTML = "<p>Cargando...</p>";

  try {
    const character = await fetchCharacter(characterName);
    const comics = await fetchComics(character.id);
    displayComics(comics);
  } catch (error) {
    comicsContainer.innerHTML = "";
    errorMessage.innerHTML = `
      <p>${error.message || "Lo sentimos..."}</p>
      <img src="IMAGES/personaje no encontrado.png" alt="Lo sentimos..." style="max-width: 200px; height: auto; margin-top: 10px;">
    `;
  }
}

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchComics();
  }
});