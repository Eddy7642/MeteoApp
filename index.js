const API_KEY = "4d8fb5b93d4af21d66a2948710284366";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const forecastContainer = document.getElementById('forecastContainer');

const weatherTranslations = {
    'Clear': 'Sereno',
    'Clouds': 'Nuvoloso',
    'Rain': 'Pioggia',
    'Drizzle': 'Pioggerella',
    'Thunderstorm': 'Temporale',
    'Snow': 'Neve',
    'Mist': 'Nebbia',
    'Smoke': 'Fumo',
    'Haze': 'Foschia',
    'Dust': 'Polvere',
    'Fog': 'Nebbia',
    'Sand': 'Sabbia',
    'Ash': 'Cenere vulcanica',
    'Squall': 'Bufera',
    'Tornado': 'Tornado'
};

const weatherIcons = {
    '01d': 'fa-sun',
    '01n': 'fa-moon',
    '02d': 'fa-cloud-sun',
    '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud',
    '03n': 'fa-cloud',
    '04d': 'fa-cloud',
    '04n': 'fa-cloud',
    '09d': 'fa-cloud-showers-heavy',
    '09n': 'fa-cloud-showers-heavy',
    '10d': 'fa-cloud-rain',
    '10n': 'fa-cloud-rain',
    '11d': 'fa-bolt',
    '11n': 'fa-bolt',
    '13d': 'fa-snowflake',
    '13n': 'fa-snowflake',
    '50d': 'fa-smog',
    '50n': 'fa-smog'
};

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

function translateWeather(weather) {
    return weatherTranslations[weather] || weather;
}

async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError("Inserisci il nome di una città");
        return;
    }
    showLoading();
    try {
        const currentWeatherData = await fetchCurrentWeather(city);
        const forecastData = await fetchForecast(city);
        updateCurrentWeather(currentWeatherData);
        updateForecast(forecastData);
        weatherContainer.style.display = 'flex';
        hideLoading();
        hideError();
    } catch (error) {
        hideLoading();
        console.error("Errore:", error);
        if (error.message === "404") {
            showError("Città non trovata. Riprova con un altro nome.");
        } else {
            showError("Si è verificato un errore. Riprova più tardi.");
        }
        weatherContainer.style.display = 'none';
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&lang=it`);
    if (!response.ok) throw new Error(response.status);
    return await response.json();
}

async function fetchForecast(city) {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&lang=it`);
    if (!response.ok) throw new Error(response.status);
    return await response.json();
}

function updateCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('currentDate').textContent = formatDate(data.dt);
    document.getElementById('currentTemp').textContent = kelvinToCelsius(data.main.temp);
    document.getElementById('weatherDescription').textContent = translateWeather(data.weather[0].main);
    document.getElementById('feelsLike').textContent = `Percepiti: ${kelvinToCelsius(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed * 3.6);
    document.getElementById('pressure').textContent = data.main.pressure;

    const iconCode = data.weather[0].icon;
    const weatherIconClass = weatherIcons[iconCode] || 'fa-question-circle';
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.className = `fas ${weatherIconClass} weather-icon mb-3`;
}

function updateForecast(data) {
    forecastContainer.innerHTML = '';
    const dailyForecasts = data.list.filter((entry) => entry.dt_txt.includes("12:00:00"));
    dailyForecasts.slice(0, 5).forEach((entry) => {
        const date = new Date(entry.dt * 1000);
        const day = date.toLocaleDateString('it-IT', { weekday: 'short' });
        const temp = kelvinToCelsius(entry.main.temp);
        const iconCode = entry.weather[0].icon;
        const iconClass = weatherIcons[iconCode] || 'fa-question-circle';
        const description = translateWeather(entry.weather[0].main);

        const forecastHTML = `
        <div class="col-md-2 col-6 text-center mb-3">
          <div class="forecast-item">
            <div>${day}</div>
            <i class="fas ${iconClass} weather-icon my-2"></i>
            <div>${temp}°C</div>
            <small>${description}</small>
          </div>
        </div>
      `;
        forecastContainer.innerHTML += forecastHTML;
    });
}

function showLoading() {
    loadingSpinner.style.display = 'inline-block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchWeather();
});

// Inizializzazione con la previsione di Roma
document.addEventListener('DOMContentLoaded', function () {
    cityInput.value = 'Roma';
    searchWeather();
});
