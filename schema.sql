DROP TABLE location_data;
DROP TABLE parks_data;

CREATE TABLE location_data (
    search_query varchar(100),
    formatted_query varchar(500),
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE TABLE weather(
    forecast VARCHAR,
    time VARCHAR (256),
   
);

CREATE TABLE parks_data (
    name varchar(100),
    address varchar(500),
    fee NUMERIC,
    description varchar(500),
    url varchar(500)
);



