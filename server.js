'use strict';


require('dotenv').config()
const PORT =process.env.PORT || 5000; 
const express = require('express'); 
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const app = express(); 
app.use(cors());


app.get('/location', handleLocation);
app.get('/weather', handleWeather);


let key=process.env.GEOCODE_API_KEY
let key2= process.env.WEACODE_API_KEY



const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log("PG PROBLEM!!!") );


app.get('/location', (request, response)=> {
    let SQL = 'SELECT * FROM student';
    client.query(SQL).then(result=> {
        console.log(result.rows);
        response.send(result.rows);
    });
});

app.get('/add', (request, response)=> {
     let city = request.query.city;
    let name = request.query.display_name;
    let latitude = request.query.lat;
    let longitude = request.query.lon;

    let SQL = 'INSERT INTO student (name, course) VALUES($1, $2) RETURNING *';
    let values = [city, name,latitude,longitude];

    
    client.query(SQL, values).then(result=> {
        console.log(result.rows);
        response.send(result.rows);
    });
});






function handleLocation(request, response) {

    // const getLocation = require('./data/location.json');
    const city = request.query.city; 
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    superagent.get(url).then(res=> {
        const data = res.body[0];
        const locationData = new Location(request.query.city, data.display_name, data.lat, data.lon);
        response.status(200).json(locationData);
    })
//  console.log(locationData)
    //    response.send()
    
   
    // const data = getLocation[0];
    // let obj=new Location(request.query.city, data.display_name, data.lat, data.lon);
    // response.send(obj);


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
    const url2 = ` https://www.weatherbit.io/api/weather-forecast=${description}-16-day`;
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




