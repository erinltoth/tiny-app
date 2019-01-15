const express = require("express");
const app = express();
const PORT = 8080; //setting default port 8080

app.set("view engine", "ejs");

const urlDatabase = [
  { shortURL: "b2xVn2", fullURL: "http://www.lighthouselabs.ca"},
  { shortURL: "9sm5xK", fullURL: "http://www.google.com"}
];

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

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, fullURL: urlDatabase };
  response.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});