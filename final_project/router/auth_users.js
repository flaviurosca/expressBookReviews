const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
  return typeof username === 'string' && username.trim().length > 0;
};

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  return user && user.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  req.session.token = accessToken;

  return res.status(200).json({ message: "Login successful!", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query;
  const { isbn } = req.params;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
  }

  const username = req.user?.username;
  if (!username) {
    return res.status(403).json({ message: "Unauthorized: No user logged in." });
  }

  const book = books[isbn];
  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated.",
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
