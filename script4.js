
// ================================
// 1. SELECT HTML ELEMENTS
// ================================

const searchForm = document.getElementById("search-form");

const cityInput = document.getElementById("city-input");

const searchBtn = document.getElementById("search-btn");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("error-message");

const currentWeather = document.getElementById("current-weather");

const forecastSection = document.getElementById("forecast-section");

const forecastContainer = document.getElementById("forecast-container");


// ================================
// 2. WEATHER ICON FUNCTION
// ================================

function getWeatherInfo(code) {

    const weatherCodes = {

        0: ["☀️", "Clear Sky"],
        1: ["🌤️", "Mainly Clear"],
        2: ["⛅", "Partly Cloudy"],
        3: ["☁️", "Overcast"],

        45: ["🌫️", "Fog"],
        48: ["🌫️", "Depositing Rime Fog"],

        51: ["🌦️", "Light Drizzle"],
        53: ["🌦️", "Moderate Drizzle"],
        55: ["🌧️", "Dense Drizzle"],

        61: ["🌧️", "Slight Rain"],
        63: ["🌧️", "Moderate Rain"],
        65: ["🌧️", "Heavy Rain"],

        71: ["🌨️", "Slight Snow"],
        73: ["❄️", "Moderate Snow"],
        75: ["❄️", "Heavy Snow"],

        80: ["🌦️", "Rain Showers"],
        81: ["🌧️", "Moderate Showers"],
        82: ["⛈️", "Heavy Showers"],

        95: ["⛈️", "Thunderstorm"],
        96: ["⛈️", "Thunderstorm with Hail"],
        99: ["⛈️", "Heavy Thunderstorm"]

    };

    return weatherCodes[code] || ["🌡️", "Unknown Weather"];

}


// ================================
// 3. SHOW ERROR
// ================================

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.hidden = false;

    currentWeather.hidden = true;

    forecastSection.hidden = true;

}


// ================================
// 4. FETCH CITY COORDINATES
// ================================

async function getCityCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("Unable to search for this city.");

    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {

        throw new Error("City not found. Please enter a valid city name.");

    }

    return data.results[0];

}


// ================================
// 5. FETCH WEATHER DATA
// ================================

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("Unable to fetch weather data.");

    }

    return await response.json();

}


// ================================
// 6. DISPLAY CURRENT WEATHER
// ================================

function displayCurrentWeather(city, data) {

    const current = data.current;

    const info = getWeatherInfo(current.weather_code);

    document.getElementById("city-name").textContent =
        `${city.name}, ${city.country}`;

    document.getElementById("current-date").textContent =
        new Date(current.time).toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "short"
        });

    document.getElementById("weather-icon").textContent =
        info[0];

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("weather-description").textContent =
        info[1];

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind-speed").textContent =
        `${current.wind_speed_10m} km/h`;

    document.getElementById("feels-like").textContent =
        `${Math.round(current.apparent_temperature)}°C`;

}


// ================================
// 7. DISPLAY FIVE DAY FORECAST
// ================================

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const daily = data.daily;

    daily.time.forEach(function(date, index) {

        const info = getWeatherInfo(
            daily.weather_code[index]
        );

        const forecastCard = document.createElement("div");

        forecastCard.className = "forecast-card";

        const day = new Date(date + "T12:00:00")
            .toLocaleDateString("en-IN", {
                weekday: "short"
            });

        forecastCard.innerHTML = `
            <h3>${day}</h3>

            <div class="forecast-icon">
                ${info[0]}
            </div>

            <p>${info[1]}</p>

            <p class="high">
                ${Math.round(daily.temperature_2m_max[index])}°C
            </p>

            <p class="low">
                ${Math.round(daily.temperature_2m_min[index])}°C
            </p>
        `;

        forecastContainer.appendChild(forecastCard);

    });

}


// ================================
// 8. MAIN SEARCH FUNCTION
// ================================

async function searchWeather(city) {

    loading.hidden = false;

    errorMessage.hidden = true;

    currentWeather.hidden = true;

    forecastSection.hidden = true;

    searchBtn.disabled = true;

    try {

        // Get City Location

        const cityData = await getCityCoordinates(city);


        // Get Weather Information

        const weatherData = await getWeather(
            cityData.latitude,
            cityData.longitude
        );


        // Display Weather

        displayCurrentWeather(cityData, weatherData);

        displayForecast(weatherData);


        currentWeather.hidden = false;

        forecastSection.hidden = false;

    }

    catch (error) {

        showError(error.message);

        console.error("Weather Error:", error);

    }

    finally {

        loading.hidden = true;

        searchBtn.disabled = false;

    }

}


// ================================
// 9. FORM SUBMIT EVENT
// ================================

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {

        showError("Please enter a city name.");

        cityInput.focus();

        return;

    }

    searchWeather(city);

});


// ================================
// 10. LOAD DEFAULT CITY
// ================================

searchWeather("New Delhi");
