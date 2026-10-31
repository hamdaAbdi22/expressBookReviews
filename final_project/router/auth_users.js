const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=> user.username === username);
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=> user.username === username && user.password === password);
  return validusers.length > 0;
}

// Task 7: Login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Error logging in. Username and password are required."});
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({message: "User successfully logged in"});
  }
  return res.status(401).json({message: "Invalid Login. Check username and password"});
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!review) {
    return res.status(400).json({message: "Review is required as a query parameter"});
  }

  const existed = books[isbn].reviews.hasOwnProperty(username);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: existed
      ? `The review for the book with ISBN ${isbn} has been modified.`
      : `The review for the book with ISBN ${isbn} has been added.`,
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews.hasOwnProperty(username)) {
    return res.status(404).json({message: `No review by ${username} found for ISBN ${isbn}`});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;