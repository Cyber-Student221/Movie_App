const apiKey = "c8514429aedc22ab3eddf717e20dadcc";
const imgAPI = "https://image.tmdb.org/t/p/w1280"
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const movieUrl = `https://www.themoviedb.org/movie/`
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;

// Fetch json data from url
async function fetchData(url){
    try {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error("Network Response was not found :(");
        }
        return await response.json();
    } catch(error) {
        return null;
    }
}

// Fetch and show results based on url
async function fetchAndShowResult(url) {
    const data = await fetchData(url);
    if(data && data.results) {
        showResults(data.results);
    }
}

// Create a movie card html template
function createMovieCard(movie) {
    const { poster_path, original_title, release_date, overview, vote_average, id} = movie;
    const tmbdbMoviePath = id ? movieUrl + id : `${original_title} TMDB Page`
    const imagePath = poster_path ? imgAPI + poster_path : "./img-01.jpeg";
    const truncatedTitle = original_title.length > 15 ? original_title.slice(0,15) + "..." : original_title;
    const truncatedOverview = overview.length > 250 ? overview.slice(0,250) + "..." : overview;
    const formattedDate = release_date || "No Release Date";
    const cardTemplate = `
        <div class="column">
        <div class="card">
            <a class="card-media" href="${imagePath}">
               <img src="${imagePath}" alt="${original_title}" width="100%" />
            </a>
        <div class="card-content">
            <div class="card-header">
                <div class="left-content">
                    <h3 style="font-weight: 600">${truncatedTitle}</h3>
                    <span style="color: #12efec">${formattedDate} <br> Rating: ${vote_average}</span>
                </div>
                <div class="right-content">
                    <a href="${tmbdbMoviePath}" target="_blank" class="card-btn">See More</a>
                </div>
            </div>
            <div class="info">
                ${truncatedOverview || "No Overview yet..."}
            </div>
        </div>
        </div>
    </div>
    `;
    return cardTemplate;

}

// Clear result element for search 
function clearResults() {
    result.innerHTML = "" //check if result.textContent = "" or result.replaceChildren ((safer))
}

// Show results in page
function showResults(item){
    const newContent = item.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No Results Found</p>"; // check (change innerHtml to somewthing else for security)
}

// Load more results
async function loadMoreResults(){
    if(isSearching){
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm ? `${searchUrl}${searchTerm}&page=${page}` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page and load more results
function detectEnd() {
    const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
    if(scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Handle Search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim();
    if(searchTerm){
        isSearching = true;
        clearResults();
        const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(newUrl);
        query.value = "";
    }
}

// Event Listeners
form.addEventListener('submit', handleSearch);
window.addEventListener('scroll', detectEnd);
window.addEventListener('resize', detectEnd);

//Initialise the page
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    isSearching = false;
    await fetchAndShowResult(url);
}

init();