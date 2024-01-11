// Global Variables
var city;
var queryURL;
var searchHistory = [];
var apiKey = "8c0a323766132cd301f2475fc0c61adc";

$(document).ready(function () {
  // Show current day, date, and time
  var currentDay = dayjs().format("dddd");
  var currentDate = dayjs().format("MMMM D, YYYY");
  var currentTime = dayjs().format("h:mm A");

  $("#currentDay").text(currentDay);
  $("#currentDate").text(currentDate);
  $("#currentTime").text(currentTime);
  $("#weather-title").text(`${currentDay}, ${currentDate}`);

// Functions
  // Save City:
  // Save city to local storage and search history
  function saveCity() {
    // If city exists in search history or if variable is empty, do not save it
    if(searchHistory.includes(city) || !city){
      return;
    }
    // Save city to local storage
    searchHistory.push(city);
    localStorage.setItem("history", JSON.stringify(searchHistory));
    // Save city to list
    $(".searchHistory").prepend(
      `<li><button type="button" class="btn btn-link cityBtn">${city}</button></li>`
    );
  }

  // Click History:
  // Get weather when a city is clicked in search history
  function clickHistory() {
    $(".cityBtn").on("click", function (event) {
      // Prevent event bubbling to siblings (other list elements)
      event.stopImmediatePropagation();
      $("#cityInput").val($(this).text());
      getWeather(event);
    });
  }

  // Get 5 Day Forecast:
  // Show 5-day forecast including day, date, icon, temp, weather, humidity, and wind speed
  function getForecast(city) {
    queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;
    fetch(queryURL).then(function (response) {
      // Check if response is successful
      if (response.ok) {
        response.json().then(function (data) {
          $(".forecast-container").empty();
          // Filter response so we only use mid-day weather
          var forecast = data.list.filter((day) =>
            day.dt_txt.includes("12:00:00"));
          console.log(`5-Day Forecast for ${data.city.name}, ${data.city.country}:`);
          console.log(forecast);
          // Loop through the five forecasted days
          for (var i = 0; i < forecast.length; i++) {
            var forecastDay = forecast[i];
              // Round temperature + wind speed to nearest integer
              var temp = Math.round(forecastDay.main.temp);
              var windSpeed = Math.round(forecastDay.wind.speed);
              // Insert the day's forecast info into the container
              var forecastCard = `
              <div class="forecast-card card col-sm shadow py-1">
              <p>${dayjs(forecastDay.dt_txt).format("dddd")}</p>
              <p>${dayjs(forecastDay.dt_txt).format("MMMM D, YYYY")}</p>
              <img class="forecast-icon" src="https://openweathermap.org/img/w/${forecastDay.weather[0].icon}.png" alt="Icon representing forecasted weather condition">
              <p>${temp} °F</p>
              <p>${forecastDay.weather[0].main}</p>
              <p><img src="./assets/images/humidity.png" alt="Rain drops"> Humidity: ${forecastDay.main.humidity}%<p>
              <p><img src="./assets/images/wind.png" alt="Gust of wind"> Wind Speed: ${windSpeed} MPH<p>
              </div>`
              $(".forecast-container").append(forecastCard);
              
            }
          });
        }
      });
      // Call to create click event listener for search history list
      clickHistory();
    }

  // Get Current Weather:
  // Show current weather including city, day, date, time, icon,
  // temp, weather, humidity, wind speed, sunrise and sunset
  function getWeather(event) {
    // Check the type of variable
    if (typeof event === "object") {
      event.preventDefault();
      city = $("#cityInput").val();
    } else if (typeof event === "string") {
      city = event;
    } 
    queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    // Alert user when no input is received
    if (!city) {
      $(".modal-title").text("Could not search!");
      $(".modal-body").text("Please enter city in search bar.");
      $(".modal").modal("show");
      return;
    }
    fetch(queryURL).then(function (response) {
      // Check if response is successful/city exists
      if (response.ok) {
        response.json().then(function (data) {
          console.log(`Current Weather for ${data.name}, ${data.sys.country}:`);
          console.log(data);
          // Round temperature + wind speed to nearest integer
          var temp = Math.round(data.main.temp);
          var windSpeed = Math.round(data.wind.speed);
          // Convert unix to standard time
          var sunrise = dayjs.unix(data.sys.sunrise).format("h:mm A");
          var sunset = dayjs.unix(data.sys.sunset).format("h:mm A");
          // Insert weather info into card
          $("#cityName").text(`${data.name}, ${data.sys.country}`);
          $("#currentTime").text(currentTime);
          $("#icon").attr("src",`https://openweathermap.org/img/w/${data.weather[0].icon}.png`);
          $("#icon").removeClass("d-none");
          $("#temp").text(`${temp} °F`);
          $("#description").text(`${data.weather[0].main} - ${data.weather[0].description}`);
          $(".humidity-card").html(`<p><img src="./assets/images/humidity.png" alt="Rain drops"> Humidity: ${data.main.humidity}%</p>`);
          $(".wind-card").html(`<p><img src="./assets/images/wind.png" alt="Gust of wind"> Wind Speed: ${windSpeed} MPH</p>`);
          $(".sun-card").html(`<p><img src="./assets/images/sunrise.png" alt="Sun rising"> Sunrise: ${sunrise}</p>
          <p><img src="./assets/images/sunset.png" alt="Sun setting"> Sunset: ${sunset}</p>`);
          // Save city to search history
          saveCity();
          // Get city's 5-day forecast
          getForecast(city);
        });
      }
      // Alert user when city/URL can not be found
      else {
        $(".modal-title").text("City not found!");
        $(".modal-body").text("No city found. Please try again.");
        $(".modal").modal("show");
      }
    });
  }

  // Load Search History:
  // Get existing search history from local storage, create search history list, and populate weather
  function loadHistory() {
    // Get existing search history
    searchHistory = JSON.parse(localStorage.getItem("history")) || [];
    console.log(`Search History: ${searchHistory}`);
    // Create search history list
    for (var i = 0; i < searchHistory.length; i++) {
      var city = searchHistory[i];
      $(".searchHistory").prepend(
        `<li><button type="button" class="btn btn-link cityBtn">${city}</button></li>`
      );
    }
    // If search history does not exist, then populate weather for San Antonio
    if(searchHistory.length === 0){
      getWeather("San Antonio, TX, US");
    }
    // Otherwise, populate weather of last searched city
    else{
      getWeather(searchHistory[searchHistory.length - 1]);
    }
  }

  // Clear Search History:
  // Clear local storage, search history list, and array
  function clearHistory() {
    localStorage.clear();
    $(".searchHistory").empty();
    searchHistory = [];
  }

  // Load search history
  loadHistory();

// Event Listeners
  // Get weather for city when search button is clicked
  $("#searchBtn").on("click", getWeather);

  // Manually click search button if enter key is pressed on search bar
  $("#cityInput").on("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      $("#searchBtn").click();
    }
  });

  // Clear search history when the button is clicked
  $("#clearBtn").on("click", clearHistory);

  // Hide modal when its close button is clicked
  $("#closeModalBtn").on("click", function () {
    $(".modal").modal("hide");
  });
}); // End of document ready