const express = require("express");
const app = express();
const PORT = 8080; //setting default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = [
  { shortURL: "b2xVn2", fullURL: "http://www.lighthouselabs.ca"},
  { shortURL: "9sm5xK", fullURL: "http://www.google.com"}
];

const users = {
  "001" : {
    id: "001",
    email: "erintoth@gmail.com",
    password: "crazy_password@!#"
  },
  "002" : {
    id: "002",
    email: "erin@erintoth.com",
    password: "super$#21pa$$"
  }
};

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
  let templateVars = { urls: urlDatabase, username: request.cookies["name"] };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = { username: request.cookies["name"]};
  response.render("urls_new", templateVars);
});

app.get("/register", (request, response) => {
  let templateVars = { username: request.cookies["name"]};
  response.render("user_reg", templateVars);
});

app.post("/register", (request, response) => {
  response.redirect('/urls');
});

app.post("/urls", (request, response) => {
  // console.log(request.body);
  const newShort = generateRandomString (1, 62);
  const newLong = Object.values(request.body);
  let newRequest = {shortURL: newShort, fullURL: newLong.join()};
  urlDatabase.push(newRequest);
  // console.log(urlDatabase);
  let redirectLink = `/urls/${newShort}`;
  // console.log(redirectLink);
  response.redirect(redirectLink);
});

app.post("/urls/:id/delete", (request, response) => {
  const id = request.params.id;
  const shortURL = urlDatabase.find((shortURL) => {
    return shortURL.id === id;
  });
  const index = urlDatabase.indexOf(id);

  urlDatabase.splice(index, 1);

  response.redirect('/urls');
});

app.post("/login", (request, response) => {
  const username = request.body.username;
  response.cookie('name', username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie('name');
  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, fullURL: urlDatabase, username: request.cookies["name"]};
  response.render("urls_show", templateVars);
});

app.post("/urls/:id", (request, response) => {
  const id = request.params.id;
  const updatedURL = request.body.newLongURL;
  for (let item of urlDatabase) {
    if (item.shortURL == id) {
      item.fullURL = updatedURL;
    }
  }
  response.redirect(`/urls/${id}`);
});

app.get('/u/:shortURL', (request, response) => {
  const newShortPath = request.originalUrl;
  const newShortString = newShortPath.split('').slice(3).join('');
  const actualSite = [];
  for (let item of urlDatabase){
    if (item.shortURL == newShortString){
      actualSite.push(item.fullURL);
    }
  }
  response.redirect(actualSite);

});

app.get('/notvalid', (response, request) => {
  response.send('Hey! That is not a valid shorURL!');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(min, max) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLength = 6;
  let randomURL = '';
  for (let i = 0; i < randomLength; i++) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let j = Math.floor(Math.random() * (max-min +1)) + min;
    randomURL += chars.charAt(j);
  };
  return randomURL;
};

