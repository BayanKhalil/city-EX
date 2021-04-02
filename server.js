'use strict';

require('dotenv').config();
const PORT =process.env.PORT;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();
app.use(cors());
//for DB
//const pg = require('pg');
//const client = new pg.Client(process.env.DATABASE_URL);

//------------------------------------------
// on request from the browser
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handlePark);

app.use(errorHandler);

function errorHandler(err, request, response,next) {
    console.log('err',err );
    response.status(500).send('something is wrong in server');
}

//client.on('error', err => console.log('Error in pg DataBase',err) );


// we will  request data from the API based on the request from the browser
//http://localhost:5000/location?city=amman

function handleLocation(request, response) {
    let key=process.env.GEOCODE_API_KEY;
    console.log('request.query', request.query);
    const city = request.query.city;
    // API
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    superagent.get(url).then(res=> {
        const data = res.body[0];
        const locationData = new Location(city, data.display_name, data.lat, data.lon);
        //sending response back to the browser
        response.status(200).send(locationData);
    }).catch(error=>{
        console.log('error from location API', error);
    });
}

function handleWeather (request,response){
    let key= process.env.WEACODE_API_KEY;
    const locationdataObj = request.query;
    console.log('locationdataObj', locationdataObj);

    const url = `https://api.weatherbit.io/v2.0/current?lat=${locationdataObj.latitude}&lon=${locationdataObj.longitude}&key=${key}&include=minutely`;
    superagent.get(url).then(res=> {
        const apiRes = res.body.data[0];
        const locationData = new Weather(apiRes.weather.description,apiRes.datetime);
        let newArr=[];
        newArr.push(locationData);
        response.status(200).send(newArr);
    });

}

function handlePark (request,response){
    let key= process.env.PARKCODE_API_KEY;
    const locationdataObj = request.query;

    const url = `https://developer.nps.gov/api/v1/parks?${locationdataObj.search_query}&api_key=${key}&limit=10`;
    superagent.get(url).then(res=> {
        const apiResPark = res.body.data.map(parkObj=>{
            const parkData=new Park(parkObj.fullName,parkObj.addresses[0].line1,parkObj.entranceFees[0].cost,parkObj.description,parkObj.url);
            return parkData;
        });
        response.status(200).send(apiResPark);
    });

}

//--------------------------------------------------------------------------------
function Location(name, location, latitude, longitude) {
    this.search_query = name,
    this.formatted_query = location,
    this.latitude = latitude,
    this.longitude = longitude;
}

function Weather(description, valid_date) {
    this.forecast = description,
    this.time = valid_date;

}

function Park(name, address, fee, description, url) {
    this.name = name,
    this.address = address,
    this.fee = fee,
    this.description = description,
    this.url = url;
}

/* client.connect().then(()=> {
    console.log('connected to DataBase');
    app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
}); */

app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));


