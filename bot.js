require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHERAPI_KEY;



const bot = new TelegramBot(token, { polling: true });


async function getWeather(lat, lon) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;
    
    const temp = weatherData.current.temp_c;
    const condition = weatherData.current.condition.text;
    const location = weatherData.location.name;

    const forecast = weatherData.forecast.forecastday[0];
    const chanceOfRain = forecast.day.daily_chance_of_rain; 

    const sunrise = weatherData.forecast.forecastday[0].astro.sunrise;
    const sunset = weatherData.forecast.forecastday[0].astro.sunset;



    return `The weather in ${location}: ${temp}°C, ${condition}. \nChance of rain: ${chanceOfRain}% \nSunrise:${sunrise} \nSunset:${sunset} `;
  } catch (error) {
    console.error(error);
    return 'Sorry, I could not fetch the weather information.';
  }
}

bot.onText(/\/weather/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please share your location to get the weather and rain details.', {
    reply_markup: {
      keyboard: [[{ text: 'Share Location', request_location: true }]],
      one_time_keyboard: true
    }
  });
});

bot.on('location', (msg) => {
  const chatId = msg.chat.id;
  const lat = msg.location.latitude;
  const lon = msg.location.longitude;
  getWeather(lat, lon).then((weatherInfo) => {
    bot.sendMessage(chatId, weatherInfo);
  });
});
