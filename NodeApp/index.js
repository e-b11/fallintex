//Express package
const express = require("express");

let app = express();

let path = require("path");

//Set port to 3000 or AWS port
const port = process.env.PORT || 3000;

//Add ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Set up knex, will have to adjust database
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "postgres",
    database: process.env.RDS_DB_NAME || "music",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

//Set up port/listening
app.listen(port, () => console.log("Website started."));
