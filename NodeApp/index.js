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

//Survey Routes
app.get("/survey", (req, res) => {
  res.render("surveyPage");
});

// app.post("/surveySubmit", (req, res) => {
//   knex("responses")
//     .insert({
//       age: parseInt(req.body.age),
//       gender: req.body.gender,
//       rel_status: req.body.rel_status,
//       occ_status: req.body.occ_status,
//       social_media_useage: req.body.social_media_useage,
//       avg_time_social: req.body.avg_time_social,
//       use_no_purpose: req.body.use_no_purpose,
//       distracted_social: req.body.distracted_social,
//       restless_no_media: req.body.restless_no_media,
//       distracted_general: req.body.distracted_general,
//       bothered_worries: req.body.bothered_worries,
//       difficult_concentrate: req.body.difficult_concentrate,
//       compare_successful: req.body.compare_successful,
//       feeling_comparison: req.body.feeling_comparison,
//       validation_social: req.body.validation_social,
//       depressed_down: req.body.depressed_down,
//       fluctuate_interests: req.body.fluctuate_interests,
//       sleep_issues: req.body.sleep_issues,
//       origin: req.body.origin,
//     })
//     .returning("surveyid")
//     .then(([rsurveyid]) => {
//       const surveyid = parseInt(rsurveyid, 10);

//       knex("survey_platforms").insert({
//         // surveyid: surveyid,
//         // platformid: req.body.facebook ? 1 : 80,
//         surveyid: 45,
//         platformid: 1,
//       });
//     })
//     .then(() => {
//       res.send("Form submitted successfully!");
//     })
//     .catch((error) => {
//       console.error("Error inserting into database:", error);
//       res.status(500).send("Internal Server Error");
//     });
// });

app.post("/surveySubmit", (req, res) => {
  // Step 1: Insert data into the first table
  let firstTableId;
  knex("responses")
    .insert({
      // Your columns and values from the form for the first table
      age: parseInt(req.body.age),
      gender: req.body.gender,
      rel_status: req.body.rel_status,
      occ_status: req.body.occ_status,
      social_media_useage: req.body.social_media_useage,
      avg_time_social: req.body.avg_time_social,
      use_no_purpose: req.body.use_no_purpose,
      distracted_social: req.body.distracted_social,
      restless_no_media: req.body.restless_no_media,
      distracted_general: req.body.distracted_general,
      bothered_worries: req.body.bothered_worries,
      difficult_concentrate: req.body.difficult_concentrate,
      compare_successful: req.body.compare_successful,
      feeling_comparison: req.body.feeling_comparison,
      validation_social: req.body.validation_social,
      depressed_down: req.body.depressed_down,
      fluctuate_interests: req.body.fluctuate_interests,
      sleep_issues: req.body.sleep_issues,
      origin: req.body.origin,
    })
    .returning("surveyid") // Retrieve the generated ID
    .then((generatedIds) => {
      firstTableId = generatedIds[0].surveyid;

      // Step 2: Insert data into the second table using the generated ID
      const checkboxes = req.body.checkboxValues || []; // Assuming checkbox values are an array

      if (checkboxes.length > 0) {
        const secondTableData = checkboxes.map((checkboxValue) => ({
          surveyid: firstTableId, // Link to the first table using the generated ID
          platformid: parseInt(checkboxValue),
        }));

        return knex("survey_platforms").insert(secondTableData);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // Step 3: Insert data into the third table using the generated ID
      const checkboxes2 = req.body.affiliationValues || []; // Assuming checkbox values are an array

      if (checkboxes2.length > 0) {
        const thirdTableData = checkboxes2.map((checkboxValue) => ({
          surveyid: firstTableId, // Link to the first table using the generated ID
          affiliationid: parseInt(checkboxValue),
        }));

        return knex("survey_affiliations").insert(thirdTableData);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error processing the form:", error);
      res.status(500).send("Internal Server Error");
    });
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
        res.cookie("username", username, { maxAge: 900000, httpOnly: true }); //creates a cookie 'username' and assigns the value of the username
        res.cookie("access", "granted", { maxAge: 900000, httpOnly: true }); //creates a cookie that sets access privileges to granted

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
      .from("responses")
      .limit(2000)
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

app.get("/viewspecificsurvey/:id", (req, res) => {
  if (req.cookies.access == "granted") {
    const responsesPromise = knex
      .select(
        "surveyid",
        "timestamp",
        "age",
        "gender",
        "rel_status",
        "occ_status",
        "social_media_useage",
        "avg_time_social",
        "use_no_purpose",
        "distracted_social",
        "restless_no_media",
        "distracted_general",
        "bothered_worries",
        "difficult_concentrate",
        "compare_successful",
        "feeling_comparison",
        "validation_social",
        "depressed_down",
        "fluctuate_interests",
        "sleep_issues",
        "origin"
      )
      .from("responses")
      .where("surveyid", req.params.id);

    const platformsPromise = knex
      .select("surveyid", "platformid")
      .from("survey_platforms")
      .where("surveyid", req.params.id);

    const affiliationsPromise = knex
      .select("surveyid", "affiliationid")
      .from("survey_affiliations")
      .where("surveyid", req.params.id);

    Promise.all([responsesPromise, platformsPromise, affiliationsPromise])
      .then(([responses, platforms, affiliations]) => {
        res.render("specificsurvey", {
          surveyData: responses,
          platformData: platforms,
          affiliationData: affiliations,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ err });
      });
  }
});

app.get("/searchresponse", (req, res) => {
  //filter data in view
  const cat = req.query.category;
  const val = req.query.value;
  let limit = req.query.limit;
  limit = parseInt(limit);
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
        .where(cat, val)
        .limit(limit);
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
        .where(cat, "like", `%${val}%`)
        .limit(limit);
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
  knex("admin")
    .where("username", req.params.username)
    .del()
    .then((myadmins) => {
      res.redirect("/viewadmins");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err });
    });
});
//CREATE FUNCTIONALITY (to be changed)
app.post("/createadmin", (req, res) => {
  const uname = req.body.adminname;
  const apassword = req.body.adminpassword;
  knex
    .raw("INSERT INTO admin (username, password) VALUES (?, ?)", [
      uname,
      apassword,
    ])
    .then((result) => {
      console.log(result);
      res.redirect("/viewadmins");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error creating admin");
    });
});
app.get("/editadmin/:username", (req, res) => {
  if (req.cookies.access == "granted") {
    const username = req.params.username;
    res.cookie("editusername", username, { maxAge: 900000, httpOnly: true }); //creates a cookie 'username' and assigns the value of the username
    knex
      .select("username", "password")
      .from("admin")
      .where("username", username)
      .then((adminresult) => {
        res.render("edituser", { adminresult });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error creating admin");
      });
  } else {
    res.send("You don't have access to this page.");
  }
});

//UPDATE FUNCTIONALITY (to be changed)
app.post("/editadmin", (req, res) => {
  if (req.cookies.access == "granted") {
    knex("admin")
      .where("username", req.cookies.editusername)
      .update({
        username: req.body.newusername,
        password: req.body.newpassword,
      })
      .then((thisAdmin) => {
        res.redirect("/viewadmins");
      });
  } else {
    res.send("You Don't have access to this page");
  }
});

// Admin logout
app.get("/adminLogout", (req, res) => {
  //remove admin cookies
  res.cookie("access", "not_granted", { maxAge: 9000, httpOnly: true }); //creates a cookie that sets access privileges to granted

  //req.cookies.access = "not_granted";
  res.redirect("/");
});

//Set up port/listening
app.listen(port, () => console.log("Website started."));
