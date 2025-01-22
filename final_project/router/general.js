const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully.' });
});

// Get the book list available in the shop
public_users.get('/', async function(req, res) {
  try {
    const getBooks = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve(books), 1000);
      });
    };

    const bookList = await getBooks();
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch book list', error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const getBookByISBN = async (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error(`No books found with ISBN: ${isbn}`));
        }
      }, 1000);
    });
  };

  const isbn = req.params.isbn;

  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const getBooksByAuthor = async (author) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = [];
        for (let key in books) {
          if (books[key].author === author) {
            booksByAuthor.push(books[key]);
          }
        }
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error(`No books found for author: ${author}`));
        }
      }, 1000);
    });
  };

  const author = req.params.author;

  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on title
public_users.get('/title/:title', async function (req, res) {
  const getBooksByTitle = async (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = [];

        for (let key in books) {
          if (books[key].title.toLowerCase() === title.toLowerCase()) {
            booksByTitle.push(books[key]);
          }
        }

        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error(`No books found with title: ${title}`));
        }
      }, 1000);
    });
  };

  const title = req.params.title;

  try {
    const booksByTitle = await getBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    res.status(200).json(reviews);
  } else {
    res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
  }
});

module.exports.general = public_users;
