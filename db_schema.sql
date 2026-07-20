
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS blogdata (
    blogdata_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blogdata_title VARCHAR(255),
    blogdata_subtitle VARCHAR(255),
    blogdata_authorname VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS draftarticles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    articletext TEXT,
    createddate DATETIME,
    updateddate DATETIME
);

CREATE TABLE IF NOT EXISTS publishedarticles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    articletext TEXT,
    publisheddate DATETIME,
    updateddate DATETIME,
    numberoflikes INTEGER
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY,
    articleid INTEGER,
    commenttext TEXT,
    posteddate DATETIME
);

--insert default data (if necessary here)

--inserting a default blog author
INSERT INTO blogdata ('blogdata_title', 'blogdata_subtitle', 'blogdata_authorname') VALUES ('Blog title', 'Blog subtitle', 'Author name');

COMMIT;

