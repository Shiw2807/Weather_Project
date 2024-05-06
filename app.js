const searchButton = document.querySelector('.search_button');
const openWeatherAPIKey = '8034c8ee25b27f0a97eee3a1dd94998a';
const accuWeatherAPIKey = 'ngN4kzvLluamcIJYLHdKmJsVcqZm6t79';

document.getElementById('change_tab').addEventListener('click', function () {
    // Get the target div element
    const targetDiv = document.getElementById('targetDiv');

    // Scroll to the target div
    targetDiv.scrollIntoView({ behavior: 'smooth' });
});


function getWeather(cityName) {
    console.log("Calling Weather API....");

    // Fetch weather data from OpenWeatherMap API
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherAPIKey}`)
        .then(response => response.json())
        .then(openWeatherData => {
            console.log(openWeatherData);

            // Fetch location data from AccuWeather API
            const accuWeatherUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${accuWeatherAPIKey}&q=${cityName}`;
            fetch(accuWeatherUrl)
                .then(response => response.json())
                .then(accuWeatherData => {
                    console.log(accuWeatherData);

                    //location key from AccuWeather API response
                    const location_key = accuWeatherData[0].Key;

                    // Fetch 5-day forecast data from AccuWeather API using location key
                    const forecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${location_key}?apikey=${accuWeatherAPIKey}`;
                    fetch(forecastUrl)
                        .then(response => response.json())
                        .then(forecastData => {
                            const dailyForecasts = forecastData.DailyForecasts;
                            console.log(dailyForecasts);

                            fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&cnt=16&appid=${openWeatherAPIKey}`)
                                .then(response => response.json())
                                .then(data => {
                                    console.log(data);
                                    updateWeather(openWeatherData, accuWeatherData, dailyForecasts);
                                })

                        })
                        .catch(error => {
                            console.error('Error fetching Forecast data:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching AccuWeather data:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching OpenWeather data:', error);
        });
}



function updateWeather(openWeatherData, accuWeatherData, dailyForecasts) {

    const place = document.querySelector('.place span');
    const temperature = document.getElementById("temperature");
    const weather_desc = document.querySelector('.weather_desc')
    const humidity = document.getElementById('humidity')
    const pressure = document.getElementById("pressure")
    const visibility = document.getElementById("visibility")
    const wind = document.getElementById("wind")
    const min_temp = document.getElementById("min_temp")
    const max_temp = document.getElementById("max_temp")
    const weather_icon = document.getElementById("weather_icon")

    const day = document.getElementById("day_temp");
    const night = document.getElementById("night_temp")

    place.innerHTML = openWeatherData.name;
    temperature.innerHTML = Math.floor(openWeatherData.main.temp - 273.15) + "°";
    weather_desc.innerHTML = openWeatherData.weather[0].description;
    humidity.innerHTML = openWeatherData.main.humidity;
    pressure.innerHTML = openWeatherData.main.pressure;
    visibility.innerHTML = openWeatherData.visibility;
    wind.innerHTML = openWeatherData.wind.speed;
    min_temp.innerHTML = openWeatherData.main.temp_min;
    max_temp.innerHTML = openWeatherData.main.temp_max;
    day.innerHTML = Math.floor(((dailyForecasts[0].Temperature.Maximum.Value) - 32) * (5 / 9)) + "°";
    night.innerHTML = Math.floor(((dailyForecasts[0].Temperature.Minimum.Value) - 32) * (5 / 9)) + "°";


    //icon
    const weatherIcon = openWeatherData.weather[0].icon
    const iconURL = `https://openweathermap.org/img/w/${weatherIcon}.png`

    weather_icon.src = iconURL;



    const containers = document.querySelector('.containers');
    if (containers) {

        dailyForecasts.forEach((forecast, index) => {
            const flexContainer = containers.children[index];

            const dateElement = flexContainer.querySelector('#date');
            if (dateElement) {
                const date = new Date(forecast.Date).toLocaleDateString('en-US', { weekday: 'short' });
                dateElement.textContent = date;
            }


            const iconElement = flexContainer.querySelector('#forecast_icon');
            if (iconElement) {
                const iconNumber = forecast.Day.Icon;

                if (iconNumber < 10) {
                    const icon = `https://developer.accuweather.com/sites/default/files/0${iconNumber}-s.png`
                    iconElement.src = icon;
                }
                else {
                    const icon = `https://developer.accuweather.com/sites/default/files/${iconNumber}-s.png`
                    iconElement.src = icon;
                }
            }

            const dayTempElement = flexContainer.querySelector('.day_temp');
            if (dayTempElement) {
                const dayTemp = Math.floor(((forecast.Temperature.Maximum.Value) - 32) * (5 / 9));
                dayTempElement.textContent = `${dayTemp}°`;
            }

            const nightTempElement = flexContainer.querySelector('.night_temp');
            if (nightTempElement) {
                const nightTemp = Math.floor(((forecast.Temperature.Minimum.Value) - 32) * (5 / 9));
                nightTempElement.textContent = `${nightTemp}°`;
            }
        });
    }

}


searchButton.addEventListener("click", () => {

    const searchInput = document.getElementById("search_input")
    const inputValue = searchInput.value;
    getWeather(inputValue);

})

