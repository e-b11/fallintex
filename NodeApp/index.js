// INTEX Social Media
// Emma Bastian, Connor Humphrey, Johnny Fietkau, Lauren do Lago

//Express package
const express = require("express");
const cookieParser = require("cookie-parser");

let app = express();
app.use(cookieParser());

let path = require("path");

//Set port to 3000 or AWS port
const port = process.env.PORT || 3000;

//Add ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Connect css file
app.use(express.static(__dirname + "/public"));

// Set up knex, will have to adjust database
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

//Regular user routes
app.get("/", (req, res) => {
  res.render("landing");
});

app.get("/survey", (req, res) => {
  res.render("surveyPage");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboardPage");
});

// app.get("/userLogin", (req, res) => {
//   res.render("userLogin");
// });

// app.post("/userLogin", (req, res) => {
//   const { username, password } = req.body;

//   knex("user")
//     .where({ username, password })
//     .first()
//     .then((user) => {
//       if (user) {
//         res.redirect("/");
//       } else {
//         res.status(401).send("Invalid username or password");
//       }
//     })
//     .catch((error) => {
//       console.error("Error querying database:", error);
//       res.status(500).send("Internal Server Error");
//     });
// });

//Admin routes
app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

app.post("/adminLogin", (req, res) => {
  const { username, password } = req.body;

  knex("admin")
    .where({ username, password })
    .first()
    .then((user) => {
      if (user) {
        res.cookie("username", username, { maxAge: 9000000, httpOnly: true }); //creates a cookie 'username' and assigns the value of the username
        res.cookie("Access", "Granted", { maxAge: 9000000, httpOnly: true }); //creates a cookie that sets access privileges to granted

        // populate the data for all admin users and send it to the admin page

        res.render("adminPage");
      } else {
        res.status(401).send("Invalid username or password");
      }
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
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
