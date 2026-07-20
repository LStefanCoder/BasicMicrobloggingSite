//Student number: 210167227 

const express = require('express');
const app = express();
const port = 3000;
const path = require('path'); //needed to use __dirname
const sqlite3 = require('sqlite3').verbose();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});


const userRoutes = require('./routes/author');
//this is for the reader pages
const readerRoutes = require('./routes/reader');

//set the app to use ejs for rendering
app.set('view engine', 'ejs'); //just testing
app.set('views', __dirname + '/views');

//setting the route for the css and js files
app.use(express.static(__dirname + '/public'));

//this adds all the userRoutes to the app under the path /author
app.use('/author', userRoutes);
app.use('/reader', readerRoutes);

//if the user only types in 'localhost:3000', the user will be directed to the author homepage
app.get('/', (req, res) => {
  res.redirect('/author/home');
});

app.listen(port, () => {
  console.log(`Microblogging site listening on port ${port}`)
})

