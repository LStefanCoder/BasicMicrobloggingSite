/**
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 */

const express = require("express");
const reader = express.Router();
const assert = require('assert');
const { createConnection } = require("net");

reader.use(express.json());
reader.use(express.urlencoded({ extended: false }));


//gets the data about the blog author for the /reader/home page
//promises are needed for the await-async workflow
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

//this function selects one entry from the published articles table with the id given
//this is used for the article edit page
function getselectedpublishedarticle(id) {
    var query = "SELECT * FROM publishedarticles WHERE article_id = ?";
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

//this function retrieves the comments for a selected article
function getcommentsforarticle(id) {
  var query = "SELECT commenttext, posteddate FROM comments WHERE articleid = ?";
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

reader.get("/home", async (req, res) => {
    //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render

    //each of the three datasets to be passed to res.render are being queried
    //await is needed so that the program doesn't jump to rendering the page before the data is ready
    var blogauthor = await getblogauthor();
    var draft = await getdraftarticles();
    var published = await getpublishedarticles();

    res.render('reader-home', {author: blogauthor, draft: draft, published: published});
});

//this is the function which renders the edit article page
//same ejs template, but different content for each of the articles
reader.get("/article/:id", async (req, res) => {
    //based on https://stackoverflow.com/questions/66436398/passing-multiple-query-objects-with-res-render
    
        //each of the three datasets to be passed to res.render are being queried
        //await is needed so that the program doesn't jump to rendering the page before the data is ready
        var blogauthor = await getblogauthor();
        var selectedarticle = await getselectedpublishedarticle(req.params.id);
        var comments = await getcommentsforarticle(req.params.id);
    
        res.render('articlepage', {author: blogauthor, article: selectedarticle, comments: comments});
    });

//this code processes the comments
reader.get("/addcomment/:id/:text", (req, res) => {

    var commentdate = getTime();
    
    //inserting a comment into the comments database
    global.db.run("INSERT INTO comments (articleid, commenttext, posteddate) VALUES (?, ?, ?)", [req.params.id, req.params.text, commentdate], function (err, res) {
      if(err) {console.log(err)}
      else 
      {

      }
    });
});

//increases the number of likes on an article by one
reader.get("/upthelikes/:id", (req, res) => {
  //we simply run the UPDATE SQL command and add 1 to the number of likes in the table
  //(https://stackoverflow.com/questions/744289/how-to-increase-value-by-a-certain-number)
  global.db.run("UPDATE publishedarticles SET numberoflikes = numberoflikes + 1 WHERE article_id = ?", req.params.id, function(err, result) {
    if(err) { console.log(err) }
    else
    {
    
    }
  });

});

///FOR TESTING
reader.get("/get", (req, res, next) => {
  //USE this pattern to retrieve data
  //NB. it's better NOT to use arrow functions for callbacks with this library

  global.db.all("SELECT * FROM comments", function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.json(rows);
    }
  });
});

module.exports = reader;