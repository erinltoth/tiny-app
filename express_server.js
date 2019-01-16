const express = require("express");
const app = express();
const PORT = 8080; //setting default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

const urlDatabase = [
  { shortURL: "b2xVn2", fullURL: "http://www.lighthouselabs.ca"},
  { shortURL: "9sm5xK", fullURL: "http://www.google.com"}
];

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls_new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, fullURL: urlDatabase };
  response.render("urls_show", templateVars);
});

app.post("/urls", (request, response) => {
  console.log(request.body);
  const newShort = generateRandomString (1, 62);
  const newLong = Object.values(request.body);
  let newRequest = {shortURL: newShort, fullURL: newLong.join()};
  urlDatabase.push(newRequest);
  response.send("Ok");
  console.log(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(min, max) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLength = 6;
  let randomURL = '';
  for (let i = -1; i < randomLength; i++) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let j = Math.floor(Math.random() * (max-min +1)) + min;
    randomURL += chars.charAt(j);
  };
  return randomURL;
};

// generateRandomString (1, 62);