const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT CHECK(length(address) <= 400),
        role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'owner'))
      )
    `, (err) => {
      if (err) console.error('Error creating Users table:', err);
      else console.log('Users table ready');
    });

    // Stores table
    db.run(`
      CREATE TABLE IF NOT EXISTS Stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
        email TEXT UNIQUE NOT NULL,
        address TEXT CHECK(length(address) <= 400),
        owner_id INTEGER,
        FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating Stores table:', err);
      else console.log('Stores table ready');
    });

    // Ratings table
    db.run(`
      CREATE TABLE IF NOT EXISTS Ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
        UNIQUE(user_id, store_id)
      )
    `, (err) => {
      if (err) console.error('Error creating Ratings table:', err);
      else console.log('Ratings table ready');
    });

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)');
    db.run('CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_ratings_store ON Ratings(store_id)');

    console.log('Database initialization complete');
  });
};

module.exports = { db, initializeDatabase };