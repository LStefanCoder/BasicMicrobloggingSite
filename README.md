##  Basic microblogging site ##
 Originally written as a midterm project for CM2040 Database Networks and the Web mmodule of the University of London Bachelor of Science Computer Science program by László Stefán.

### Note on operating systems ###

If the user is on Linux or Mac, the package.json file should be changed from: 

"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build-db": "type db_schema.sql | sqlite3 database.db ",
    "clean-db": "del /f database.db",
    "start": "node index.js"
  },

to:

"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build-db": "cat db_schema.sql | sqlite3 database.db ",
    "clean-db": "rm database.db",
    "start": "node index.js"
  },

### Accessing the author and the reader pages ###

The author page is available under localhost:3000/author/home, and the reader page is on localhost:3000/reader/home, the draft page under localhost:3000/author/draft, and the settings page under localhost:3000/author/settings.

#### Possible commands ####

To install all the node packages run ```npm install``` from the project directory

Run ```npm run build-db``` to create the database (database.db)
Run ```npm run start``` to start serving the web app (Access via http://localhost:3000)

You can also run: 
```npm run clean-db``` to delete the database before rebuilding it for a fresh start