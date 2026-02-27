


const apiKey = "09f4fb7bfd1840a655a2f17fda000ef4";
let isCelsius = true;

let currentWeatherData = null;  // extra
let currentForecastData = null; // extra

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

    //dynamicBackground(data.weather[0].main);

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


    currentForecastData = data;   // 👈 STORE FULL DATA      // extra

    displayForecast();            // 👈 render using separate function    // extra


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



//display toogle forecast //extra

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

        // <h3>${temp.toFixed(1)}°</h3> ---> got replaced 
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

//-------------


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



// updated function # 2 again //extra


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



// new eventListener calling:  // extra
recentCitiesDropdown.addEventListener("change", (e) => {

    const selectedCity = e.target.value;

    if (!selectedCity) return;

    fetchWeather(selectedCity);

    // Reset back to placeholder after fetch
    setTimeout(() => {
        recentCitiesDropdown.value = "";
    }, 100);
});



//new -- logic for clear history

clearHistoryBtn.addEventListener("click", () => {

    localStorage.removeItem("recentCities");

    recentCitiesDropdown.innerHTML = `
      <option value="" selected disabled>Select History</option>
  `;

    recentCitiesDropdown.classList.add("hidden");
    clearHistoryBtn.classList.add("hidden");
});




loadRecentCities();



// extra 


document.body.style.backgroundImage =
    "url('cloud.jpg')";


// https://images.unsplash.com/photo-1592698117601-70c282996f9c //new

// https://images.unsplash.com/photo-1502082553048-f009c37129b9     // old