//Express package
const express = require("express");

let app = express();

let path = require("path");

//Set port to 3000 or AWS port
const port = process.env.PORT || 3000;

//Add ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Connect css file
app.use(express.static(__dirname + "/public"));

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

// READ FUNCTIONALITY (to be changed)
// app.get("/", (req, res) => {
//   knex
//     .select("band_name", "lead_singer")
//     .from("bands")
//     .then((bands) => {
//       res.render("displayBand", { mybands: bands });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ err });
//     });
// });

//UPDATE FUNCTIONALITY (to be changed)
// app.post("/editBand", (req, res) => {
//   knex("bands").where("band_id", parseInt(req.body.bandID)).update({
//       band_name: req.body.bandName,
//       lead_singer: req.body.singer
//   }).then(mybands => {
//       res.redirect("/");
//   });
// });

//CREATE FUNCTIONALITY (to be changed)
// app.post("/addBand", (req, res) => {
//   knex("bands").insert(req.body).then(mybands => {
//       res.redirect("/");
//   })
// });

//DELETE FUNCTIONALITY
// app.post("/deleteBand/:id", (req, res) => {
//   knex("bands").where("band_id", req.params.id).del().then(mybands => {
//       res.redirect("/");
//   }).catch(err => {
//       console.log(err);
//       res.status(500).json({err});
//   })
// });

//Set up port/listening
app.listen(port, () => console.log("Website started."));
