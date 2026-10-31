const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Unable to register user. Username and password are required."});
  }
  if (isValid(username)) {
    return res.status(409).json({message: "User already exists!"});
  }
  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  let result = [];
  keys.forEach(key => {
    if (books[key].author === author) {
      result.push({isbn: key, title: books[key].title, reviews: books[key].reviews});
    }
  });
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({booksbyauthor: result}, null, 4));
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  let result = [];
  keys.forEach(key => {
    if (books[key].title === title) {
      result.push({isbn: key, author: books[key].author, reviews: books[key].reviews});
    }
  });
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({booksbytitle: result}, null, 4));
  }
  return res.status(404).json({message: "No books found with this title"});
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});

// ================== Tasks 10-13: Promises / Async-Await with Axios ==================
const BASE_URL = "http://localhost:5000";

// Task 10: Get all books using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error retrieving the book list", error: error.message});
  }
});

// Task 11: Get book details by ISBN using Promise callbacks with Axios
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => res.status(200).send(JSON.stringify(response.data, null, 4)))
    .catch(error => res.status(404).json({message: `Book with ISBN ${isbn} not found`}));
});

// Task 12: Get book details by Author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(404).json({message: `No books found for author ${author}`});
  }
});

// Task 13: Get book details by Title using Promise callbacks with Axios
public_users.get('/promise/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then(response => res.status(200).send(JSON.stringify(response.data, null, 4)))
    .catch(error => res.status(404).json({message: `No books found with title ${title}`}));
});

module.exports.general = public_users;