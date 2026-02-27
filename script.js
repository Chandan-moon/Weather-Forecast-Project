

const apiKey = "09f4fb7bfd1840a655a2f17fda000ef4";
let isCelsius = true;

let currentWeatherData = null;
let currentForecastData = null;

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const todayWeather = document.getElementById("todayWeather");
const forecastContainer = document.getElementById("forecastContainer");
const errorBox = document.getElementById("errorBox");
const unitToggle = document.getElementById("unitToggle");
const recentCitiesDropdown = document.getElementById("recentCities");



// SEARCH EVENT
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }
    fetchWeather(city);
    saveRecentCity(city);
});


// CURRENT LOCATION
locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
    });
});


// UNIT TOGGLE
unitToggle.addEventListener("click", () => {

    if (!currentWeatherData) return; // preventing error 

    isCelsius = !isCelsius;

    unitToggle.textContent = isCelsius ? "°F" : "°C";

    displayTodayWeather(currentWeatherData);

    displayForecast();  // re-render forecast 
});



// FETCH WEATHER
async function fetchWeather(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        displayTodayWeather(data);
        fetchForecast(city);


        cityInput.value = '';

    } catch (err) {
        showError(err.message);
    }

}



// Fetch Weather by Coordinates / LOCATION
async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        if (!res.ok) throw new Error("Unable to fetch location weather");

        const data = await res.json();
        displayTodayWeather(data);
        fetchForecast(data.name);

    } catch (err) {
        showError("Location access failed");
    }
}


// DISPLAY TODAY
function displayTodayWeather(data) {

    currentWeatherData = data;

    let temp = data.main.temp;
    if (!isCelsius) temp = (temp * 9 / 5) + 32;


    todayWeather.innerHTML = `
    <h2 class="text-2xl font-bold">${data.name}</h2>
    <p class="text-5xl">${temp.toFixed(1)}°</p>
    <p>${data.weather[0].main}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} m/s</p>
  `;


    // Updating emoji dynamically
    updateWeatherEmoji(data.weather[0].main);

    if (data.main.temp > 40) {
        showError("⚠ Extreme Heat Alert!");
    }
}


// 5 DAY FORECAST
async function fetchForecast(city) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();


    currentForecastData = data;

    displayForecast();            // rendering seperate display for forecast 


    forecastContainer.innerHTML = "";

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));



    dailyData.forEach(day => {
        forecastContainer.innerHTML += `

      <div class="bg-white/20 p-4 rounded-xl text-center">
        <p>${day.dt_txt.split(" ")[0]}</p>
        <p>${day.main.temp}°C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>💨 ${day.wind.speed} m/s</p>
      </div>
    `;
    });
}



//display forecast toggle 

function displayForecast() {

    if (!currentForecastData) return;

    forecastContainer.innerHTML = "";

    const daily = currentForecastData.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    daily.forEach(day => {

        let temp = day.main.temp;

        if (!isCelsius) {
            temp = (temp * 9 / 5) + 32;
        }


        forecastContainer.innerHTML += `
      <div class="forecast-card bg-white/20 p-4 rounded-xl text-center">
        <p>${day.dt_txt.split(" ")[0]}</p>

        
        <h3>${temp.toFixed(1)}°${isCelsius ? "C" : "F"}</h3>

        <p>💧 ${day.main.humidity}%</p>
        <p>💨 ${day.wind.speed} m/s</p>
      </div>
    `;
    });
}




// ERROR DISPLAY
function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
    setTimeout(() => {
        errorBox.classList.add("hidden");
    }, 3000);
}


// SAVE RECENT CITY
function saveRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }

    loadRecentCities();
}



const clearHistoryBtn = document.getElementById("clearHistoryBtn");

function loadRecentCities() {

    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (cities.length === 0) {
        recentCitiesDropdown.classList.add("hidden");
        clearHistoryBtn.classList.add("hidden");
        return;
    }

    recentCitiesDropdown.classList.remove("hidden");
    clearHistoryBtn.classList.remove("hidden");

    recentCitiesDropdown.innerHTML = `
      <option value="" selected disabled>Select History</option>
  `;

    cities.forEach(city => {
        recentCitiesDropdown.innerHTML += `
      <option value="${city}">${city}</option>
    `;
    });

    recentCitiesDropdown.value = "";
}



// logic for rendering recentCitiesDropdown
recentCitiesDropdown.addEventListener("change", (e) => {

    const selectedCity = e.target.value;

    if (!selectedCity) return;

    fetchWeather(selectedCity);

    // Reseting back to placeholder after fetch
    setTimeout(() => {
        recentCitiesDropdown.value = "";
    }, 100);
});



// logic for clear history

clearHistoryBtn.addEventListener("click", () => {

    localStorage.removeItem("recentCities");

    recentCitiesDropdown.innerHTML = `
      <option value="" selected disabled>Select History</option>
  `;

    recentCitiesDropdown.classList.add("hidden");
    clearHistoryBtn.classList.add("hidden");
});



loadRecentCities();



// Weather to Emoji Image Mapping

const weatherEmojiMap = {
    Clear: "./src/images/clear.jpg",
    Clouds: "./src/images/cloud1.jpg",
    Rain: "./src/images/rain.jpg",
    Drizzle: "./src/images/rain.jpg",
    Snow: "./src/images/snow and thunder.jpg",
    Thunderstorm: "./src/images/snow and thunder.jpg",
    Mist: "./src/images/cloud1.jpg",
    Fog: "./src/images/cloud1.jpg",
    Haze: "./src/images/cloud1.jpg"
};



// Update Weather Emoji -- (weather fetching data accordance to day)

function updateWeatherEmoji(weatherType) {
    const emojiImg = document.getElementById("weatherEmojiImg");

    const imgSrc = weatherEmojiMap[weatherType] || "./src/images/cloud1.jpg";

    emojiImg.src = imgSrc;
}



// setting background

document.body.style.backgroundImage = "url('./src/images/cloud.jpg')";