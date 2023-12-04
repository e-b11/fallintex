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
    database: process.env.RDS_DB_NAME || "intex",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

app.get("/", (req, res) => {
  res.render("landing");
});

app.get("/login", (req, res) => {
  // knex
  //   .select()
  //   .from("authentication")
  //   .then((authentication) => {
  //     res.render("loginPage", { myauthentication: authentication });
  //   });
  res.render("loginPage");
});

app.post("/authenticate", (req, res) => {
  knex
    .select("username", "password")
    .from("authentication")
    .where("username", req.body.username)
    .andWhere("password", req.body.password)
    .then((authentication) => {
      res.render("adminPage", { myauthentication: authentication });
    });
});

// app.post("/authenticate", (req, res) => {
//   let usernamesubmit = req.body.username;
//   let passwordsubmit = req.body.password;

// })

app.get("/survey", (req, res) => {
  res.render("surveyPage");
});

// app.post("/submitSurvey", (req, res) => {
//   knex("survey")
//     .insert({
//       country_name: req.body.country_name.toUpperCase(),
//       popular_site: req.body.popular_site.toUpperCase(),
//       capital: req.body.capital.toUpperCase(),
//       population: req.body.population,
//       visited: req.body.visited ? "Y" : "N",
//       covid_level: req.body.covid_level.toUpperCase(),
//     })
//     .then((mycountry) => {
//       res.redirect("/");
//     });
// });

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
