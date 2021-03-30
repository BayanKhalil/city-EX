'use strict';


require('dotenv').config()
const PORT =process.env.PORT ; 
const express = require('express'); 
const cors = require('cors');
const superagent = require('superagent');

const app = express(); 
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handlePark);


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log("PG PROBLEM!!!") );

app.get('/location', (request, response)=> {
    let SQL = 'SELECT * FROM location';
    client.query(SQL).then(result=> {
        console.log(result.rows);
        response.send(result.rows);
    });
});

app.get('/add', (request, response)=> {
    let city = request.query.city;
    let name = data.display_name;
    let latitude =data.lat
    let longitude =data.lon
    // Binding: Safe paramters Secured way (NO SQL INJECTION WILL HAPPEN)
    let SQL = 'INSERT INTO student (name, course) VALUES($1, $2) RETURNING *';
    let values = [city, name,latitude,longitude];

    // let SQL2 = `INSERT INTO student (name, course) VALUES(${name}, ${values})`;
    
    client.query(SQL, values).then(result=> {
        console.log(result.rows);
        response.send(result.rows);
    });
});

app.use(cors());

client.connect().then(()=> {
    console.log("connected");
    app.listen(PORT, ()=> console.log(`App is running on ${PORT}`));
});


let key=process.env.GEOCODE_API_KEY
let key2= process.env.WEACODE_API_KEY
let key3= process.env.PARKCODE_API_KEY
function handleLocation(request, response) {
// const getLocation = require('./data/location.json');
        //  to read the city valu
    const city = request.query.city; 
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    superagent.get(url).then(res=> {
        const data = res.body[0];
        const locationData = new Location(request.query.city, data.display_name, data.lat, data.lon);
        response.status(200).json(locationData);
    })
//  console.log(locationData)
    //    response.send()
    

    };

    function handleWeather (request,response){
        const city = request.query; 
        // console.log(request.query);
        // this give us info from th browser who send the request
        // response.send(request.query);
        const url = `https://api.weatherbit.io/v2.0/current?lat=${city.latitude}&lon=${city.longitude}&key=${key2}&include=minutely`
        superagent.get(url).then(res=> {
         // this give us info from th API that will give me weather condition
            // console.log(res);
            const apiRes = res.body.data;
            // console.log(apiRes);
        //----------------------------------
            // apiRes.forEach(item=>{
            //     item.weather.description
            //      item.datetime      
            // })
     //----------------------------------
            const locationData = new Weather(apiRes[0].weather.description,apiRes[0].datetime);
            let newArr=[]
            newArr.push(locationData)
            // console.log(newArr);
            response.send(newArr);
            response.status(200).json(locationData);
        })

    }






    function handlePark (request,response){
        const city = request.query; 
        console.log(request.query);
        // this give us info from th browser who send the request
        // response.send(request.query);
        const url = `https://developer.nps.gov/api/v1/parks?${city.formatted_query}&api_key=${key3}`
        superagent.get(url).then(res=> {
         // this give us info from th API that will give me weather condition
            // console.log(res);
            const apiResPark = res.body.data.map(parkObj=>{
                const parkData=new Park(parkObj.fullName,parkObj.addresses[0],parkObj.entranceFees[0],parkObj.description,parkObj.url)
                return parkData;
            });
            response.send(apiResPark);
            response.status(200).json(locationData);

        })

    }


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

function Park(name, address, fee, description, url) {
        this.name = name,
        this.address = address,
        this.fee = fee,
        this.description = description,
        this.url = url
}





app.listen(PORT, ()=> console.log(`App is running on Server on port: ${PORT}`));




