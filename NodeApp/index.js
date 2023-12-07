// INTEX Social Media
// Emma Bastian, Connor Humphrey, Johnny Fietkau, Lauren do Lago

//Express package
const express = require("express");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");

let path = require("path");
const faviconPath = path.join(__dirname, "public");
let app = express();

//Set port to 3000 or AWS port
const port = process.env.PORT || 3000;

//Add ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Connect css file
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(faviconPath, "favicon.ico")));

// Set up knex, will have to adjust database
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "password",
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
        res.cookie("access", "granted", { maxAge: 9000000, httpOnly: true }); //creates a cookie that sets access privileges to granted

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

app.get("/viewsurveys", (req, res) => {
  //view data
  //view survey results
  if (req.cookies.access == "granted") {
    // Query the 'responses' table to fetch all data
    knex
      .select(
        "surveyid",
        "timestamp",
        "age",
        "gender",
        "rel_status",
        "occ_status",
        "avg_time_social",
        "origin"
      )
      .from("responses").limit(30)
      .then((surveyData) => {
        const pageuser = req.cookies.username;
        // Render the 'rviewsurveys' EJS file and pass the adminData to it
        res.render("viewsurveys", { surveyData, pageuser });
      })
      .catch((error) => {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.send("You do not have access to this page");
  }
});

app.get("/searchresponse", (req, res) => {
  //filter data in view
  const cat = req.query.category;
  const val = req.query.value;
  let limit = req.query.limit;
  limit = parseInt(limit)
  if (req.cookies.access == "granted") {
    // Query the 'responses' table to fetch all data
    let query;
    if (cat == "surveyid" || cat == "age") {
      query = knex
        .select(
          //query integers
          "surveyid",
          "age",
          "gender",
          "rel_status",
          "occ_status",
          "avg_time_social",
          "origin"
        )
        .from("responses")
        .where(cat, val).limit(limit);
    } else {
      query = knex
        .select(
          //query strings
          "surveyid",
          "age",
          "gender",
          "rel_status",
          "occ_status",
          "avg_time_social",
          "origin"
        )
        .from("responses")
        .where(cat, "like", `%${val}%`).limit(limit);
    }
    query //the query was created by the if statement, execute that part then this is what you do with it.
      .then((surveyData) => {
        const pageuser = req.cookies.username;
        // Render the 'viewsurveys' EJS file and pass the adminData to it
        res.render("viewsurveys", { surveyData, pageuser });
      })
      .catch((error) => {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.send("You do not have access to this page");
  }
});

app.get("/viewadmins", (req, res) => {
  if (req.cookies.access == "granted") {
    knex
      .select("username", "password")
      .from("admin")
      .then((adminData) => {
        const pageuser = req.cookies.username;
        // Render the 'viewsurveys' EJS file and pass the adminData to it
        res.render("viewadmins", { adminData, pageuser });
      })
      .catch((error) => {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.send("You do not have access to this page.");
  }
});


// DELETE FUNCTIONALITY
app.post("/deleteadmin/:username", (req, res) => {
  knex("admin").where("username", req.params.username).del().then(myadmins => {
      res.redirect("/viewadmins");
  }).catch(err => {
      console.log(err);
      res.status(500).json({err});
  })
});

//CREATE FUNCTIONALITY (to be changed)
app.post("/createadmin", (req, res) => {
  const uname = req.body.adminname
  const apassword = req.body.adminpassword
  knex.raw('INSERT INTO admin (username, password) VALUES (?, ?)',[uname,apassword])
  .then((result) => {
    console.log(result);
    res.redirect("/viewadmins");
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error creating admin");
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




//Set up port/listening
app.listen(port, () => console.log("Website started."));
