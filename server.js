'use strict';

require('dotenv').config();
const PORT =process.env.PORT;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();
app.use(cors());
//for DB
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

//------------------------------------------
// on request from the browser
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handlePark);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);


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
    // console.log('request.query', request.query);
    const city = request.query.city;
    let SQL =`SELECT * FROM location_data WHERE lower(search_query)='${city.toLowerCase()}'`
    client.query(SQL).then(res=>{
        let dataFromDb=res.rows[0];
    })
    if (dataFromDb){
        response.status(200).send(dataFromDb)
    }else{
        
        // API
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
        superagent.get(url).then(res=> {
            const data = res.body[0];
            const locationData = new Location(city, data.display_name, data.lat, data.lon);
            //sending response back to the browser
            response.status(200).send(locationData);
            //saving to DB
            let SQL =`INSERT INTO location_data (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4) RETURNING *`
             let values = Object.values(locationData);
             client.query(SQL,values).then(res=>{
                 console.log(res);
             })
        }).catch(error=>{
            console.log('error from location API', error);
        });
    }
}

function handleWeather (request,response){
    let key= process.env.WEACODE_API_KEY;
    const locationdataObj = request.query;
    // console.log('locationdataObj', locationdataObj);

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
    let SQL =`SELECT * FROM location_data WHERE lower(search_query)='${locationdataObj.toLowerCase()}'`
    client.query(SQL).then(res=>{
        let dataFromDb=res.rows[0];
    })
    if (dataFromDb){
        response.status(200).send(dataFromDb)
    }else{

        const url = `https://developer.nps.gov/api/v1/parks?${locationdataObj.search_query}&api_key=${key}&limit=10`;
        superagent.get(url).then(res=> {
            const apiResPark = res.body.data.map(parkObj=>{
                const parkData=new Park(parkObj.fullName,parkObj.addresses[0].line1,parkObj.entranceFees[0].cost,parkObj.description,parkObj.url);
                return parkData;
            });
            response.status(200).send(apiResPark);
            let SQL =`INSERT INTO parks_data (name,address,fee,description,url) VALUES($1,$2,$3,$4,$5) RETURNING *`
            let values = Object.values(parkData);
            client.query(SQL,values).then(res=>{
                console.log(res);
            })

            
        });
    }


}

function handleMovies (request,response){
    let key= process.env.MOVCODE_API_KEY;
    const moviesdataObj = request.query;
    // console.log(moviesdataObj);

    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=us`;
    superagent.get(url).then(res=> {
        const apiResMoves = res.body.results.map(movieObj=>{
            const movieData=new Movies(movieObj.title,movieObj.overview,movieObj.vote_average,movieObj.vote_count,`https://image.tmdb.org/t/p/w500/${movieObj.poster_path}`,movieObj.popularity,movieObj.release_date);
            return movieData;
        });
        response.status(200).send(apiResMoves);
    });

}


function handleYelp (request,response){
    let key= process.env.YELPCODE_API_KEY;
    const yelpdataObj = request.query;
    console.log(yelpdataObj);

    const url = `https://api.yelp.com/v3/businesses/search?accessToken=${key}Y&term=food`;
    superagent.get(url).set('Authorization', `Bearer ${key}`).then(res=> {
        const apiResYelp = res.body.results.map(yelpObj=>{
            const yelpData=new Yelp(yelpObj.name,yelpObj.image_url,yelpObj.price,yelpObj.rating,yelpObj.url);
            return yelpData;
        });
        response.status(200).send(apiResYelp);
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
function Movies(title, overview, average_votes, total_votes, image_url, popularity, released_on){
    this.title = title;
    this.overview = overview;
    this.average_votes = average_votes;
    this.total_votes = total_votes;
    this.image_url = image_url;
    this.popularity = popularity;
    this.released_on = released_on;
}

function Yelp (name,image_url,price,rating,url){
    this.name= name;
    this.image_url= image_url;
    this.price=price;
    this.rating=rating;
    this.url=url;
    
}



 client.connect().then(()=> {
    console.log('connected to DataBase');
    app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));
});

// app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));


