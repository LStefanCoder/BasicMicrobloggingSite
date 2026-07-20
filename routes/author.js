
/**
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 */

const express = require("express");
const router = express.Router();
const assert = require('assert');
const { createConnection } = require("net");
const { type } = require("express/lib/response");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/* The functions used in the GET and POST routes are placed at the start of the JS file */

//gets the data about the blog author for the /author/home page
function getblogauthor() {
  //the query is passed into a variable for it to be more easily used
  var query = "SELECT blogdata_title, blogdata_subtitle, blogdata_authorname FROM blogdata WHERE blogdata_id = 1";
  //this promise gives back data
  //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render
  return new Promise((resolve, reject) => {
    global.db.all(query, function(err, result) {
      if(err) 
      {
        reject(err);
      }
      else
      {
        resolve(result);
      }
    })
  })
}

function getdraftarticles() {
  //the query is passed into a variable for it to be more easily used
  var query = "SELECT * FROM draftarticles";
  //this promise gives back data
  //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render
  return new Promise((resolve, reject) => {
    global.db.all(query, function(err, result) {
      if(err) 
      {
        reject(err);
      }
      else
      {
        resolve(result);
      }
    })
  })
}

function getpublishedarticles() {
  //the query is passed into a variable for it to be more easily used
  var query = "SELECT * FROM publishedarticles";
  //this promise gives back data
  //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render
  return new Promise((resolve, reject) => {
    global.db.all(query, function(err, result) {
      if(err) 
      {
        reject(err);
      }
      else
      {
        resolve(result);
      }
    })
  })
}

//this function gives back a string to be entered as a DATETIME format into the database
//based on https://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
function getTime() {
  var time = new Date();
  var month;
  var date;
  var hours;
  var minutes;
  var seconds;

  month = time.getMonth()+1;

  //this code adds a 0 to all places where the number returned has just one digit
  if (time.getDate() < 10)
  {date = "0" + time.getDate();}
  else {date = time.getDate();}

  if (time.getHours() < 10)
  {hours = "0" + time.getHours();}
  else {hours = time.getHours();}

  if (time.getMinutes() < 10)
  {minutes = "0" + time.getMinutes();}
  else {minutes = time.getMinutes();}

  if (time.getSeconds() < 10)
  {seconds = "0" + time.getSeconds();}
  else {seconds = time.getSeconds();}
  
  var currentdate = time.getFullYear() + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

  return currentdate;
}

//this function selects one entry from the draft articles table with the id given
//this is used for the article edit page
function getselecteddraftarticle(id) {
  var query = "SELECT * FROM draftarticles WHERE article_id = ?";
  return new Promise((resolve, reject) => {
    global.db.all(query, id, function(err, result) {
      if(err) 
      {
        reject(err);
      }
      else
      {
        resolve(result);
      }
    })
  })
}

//the following functions each retrieve an aspect from the draftarticles database
//they are needed in order to implement the publish button
//they all use Javascript callbacks, since async functions don't perform well in a browser setting

//based on https://stackoverflow.com/questions/32551515/sqlite3-callbacks-node-js
function getdraft_title(id, cb)
{
  var value;
  const query = "SELECT title FROM draftarticles WHERE article_id = ?";
  global.db.get(query, [id], function(err, result) {
      if(err) {cb(err, null);}
      else
      {
        cb(null, result);
      }
  });
}

function getdraft_subtitle(id, cb)
{
  const query = "SELECT subtitle FROM draftarticles WHERE article_id = ?";
    global.db.get(query, [id], function(err, result) {
      if(err) {cb(err, null);}
      else
      {
        cb(null, result);
      }
  })
}

function getdraft_articletext(id, cb)
{
  const query = "SELECT articletext FROM draftarticles WHERE article_id = ?";
    global.db.get(query, [id], function(err, result) {
      if(err) {cb(err, null);}
      else
      {
        cb(null, result);
      }
    })
}

//serves the settings page with the blog author data loaded in
router.get("/settings", (req, res) => {
  const authorquery = "SELECT blogdata_title, blogdata_subtitle, blogdata_authorname FROM blogdata WHERE blogdata_id = 1";
  var author;
  global.db.all(authorquery, function(err, result){
    if (err) {}
    else{
      res.render("settings", {author: result});
    }
  })
});

//processes the updated author data and puts them in the database
router.post("/settings", (req, res) => {
  var title = req.body.title;
  var subtitle = req.body.subtitle;
  var authorname = req.body.authorname;

  global.db.all("UPDATE blogdata SET blogdata_title=?, blogdata_subtitle=?, blogdata_authorname=? WHERE blogdata_id = ?",[title, subtitle, authorname, 1], function(err, result) {
    if(err)
    {
    }
    else{
      res.redirect("home");
    }
  });
});

//the author home page
//async is used in conjunction with await in order to make sure that the all database queries are finished before the page is served
router.get("/home", async (req, res, next) => {
    //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render

    //each of the three datasets to be passed to res.render are being queried
    //await is needed so that the program doesn't jump to rendering the page before the data is ready
    var blogauthor = await getblogauthor();
    var draft = await getdraftarticles();
    var published = await getpublishedarticles();

    res.render('author-home', {author: blogauthor, draft: draft, published: published});
    
});

//this is the function which renders the edit article page
//same ejs template, but different content for each of the articles
router.get("/editarticle/:id", async (req, res) => {
//based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render

    //each of the three datasets to be passed to res.render are being queried
    //await is needed so that the program doesn't jump to rendering the page before the data is ready
    var blogauthor = await getblogauthor();
    var selectedarticle = await getselecteddraftarticle(req.params.id);

    res.render('editpage', {author: blogauthor, article: selectedarticle});
});

//this processes the updated article
router.post("/editarticle/:id", (req, res) => {
  //the current date to be inserted into the draftarticles table
  var currentdate = getTime();

  //assigning the req queries to variables reduces clutter in the actual query
  var title = req.body.title;
  var subtitle = req.body.subtitle;
  var articletext = req.body.articletext;

  global.db.all("UPDATE draftarticles SET title=?, subtitle=?, articletext=?, updateddate=? WHERE article_id = ?",[title, subtitle, articletext, currentdate, req.params.id], function(err, result) {
    if(err)
    {
    }
    else{
      res.redirect("/author/home");
    }
  });
});

//the colon represents a URL pattern, where the part after the colon is a variable
router.get("/deletedraft/:id", (req, res) => {
    global.db.run("DELETE FROM draftarticles WHERE article_id = ?", req.params.id, function(err, result) {
        if(err) { }
        else { }
    });
});

//the colon represents a URL pattern, where the part after the colon is a variable
router.get("/deletepublished/:id", (req, res) => {
  global.db.run("DELETE FROM publishedarticles WHERE article_id = ?", req.params.id, function(err, result) {
    if(err) { }
    else { }
  });
});


//this route publishes a certain draft article
router.get("/publishdraft/:id", (req, result) => {
  var currentdate = getTime();

  //all the results will be pushed to an array
  var array = [];
  //getting the three inputs for the database query, which themselves come from a database query
  //this is a callback function based on https://stackoverflow.com/questions/32551515/sqlite3-callbacks-node-js
  //we need a callback cascade, since async queries are not optimal for browsers

  getdraft_title(req.params.id, function(err, res) {
    if (err) console.log(err);
    else{
      array.push(res);
      getdraft_subtitle(req.params.id, function (err, res){
        if (err) console.log(err);
        else{
          array.push(res);
          getdraft_articletext(req.params.id, function(err, res) {
            if (err) console.log(err);
            else {
              array.push(res);
              //inserting the record into the published articles table
              global.db.run("INSERT INTO publishedarticles (title, subtitle, articletext, publisheddate, updateddate, numberoflikes) VALUES (?, ?, ?, ?, ?, ?)", [array[0].title, array[1].subtitle, array[2].articletext, currentdate, currentdate, 0], function(err, res) {
                if(err) {console.log(err);}
                else
                {
                  //deleting the record from the draft articles
                  global.db.run("DELETE FROM draftarticles WHERE article_id = ?", req.params.id, function(err, res) {
                    if(err) {console.log(err);}
                    else 
                    {
                      
                    }
                  });
                }
            });
            }
          });
        }
      });
    }

  });
  
});

//this renders the page that appears when the author clicks the "Create new draft" button.
router.get("/draft", (req, res) => {
    res.render("draft");
});

router.post("/draft", (req, res, next) => {
  
    var articledate = getTime();

    //inserting the new article into the articles table
    global.db.run("INSERT INTO draftarticles ('title', 'subtitle', 'articletext', 'createddate', 'updateddate') VALUES (?,?,?,?,?);", [req.body.title, req.body.subtitle, req.body.articletext, articledate, articledate], function(err) {
      if(err)
      {
        next(err);
      }
      else {
        res.redirect("/author/home");
      }
    });
});

///////////////////////////////////////////// HELPERS ///////////////////////////////////////////
///ORIGINAL CODE///


/**
 * @desc choose and return an item from an array
 * @returns the item
 */
function choose(array) {
  assert(Array.isArray(array), "Not an array");
  const i = Math.floor(Math.random() * array.length);
  return array[i];
}

module.exports = router;
