'use strict';


const PORT = 3000; 
const express = require('express'); 
const cors = require('cors');

const app = express(); 
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function handleLocation(request, response) {

    const getLocation = require('./data/location.json');
    // const city = request.query.city; 
   
    const data = getLocation[0];
    let obj=new Location(request.query.city, data.display_name, data.lat, data.lon);
    response.send(obj);


    };


function Location(name, location, latitude, longitude) {
        this.search_query = name,
        this.formatted_query = location,
        this.latitude = latitude,
        this.longitude = longitude
}

function Weather(description, valid_date) {
    this.forecast = description,
     this.time = valid_date;

}

function handleWeather(request, response){
    const objData = require('./data/weather.json');
    const weatherData = objData.data;
    const returnedData = [];
    console.log(request.query)
    weatherData.forEach(a => {
        returnedData.push(new Weather(a.weather.description, a.valid_date));
    });
    response.send(returnedData);


}




app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));




