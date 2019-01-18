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
  "59284" : {
    id: "59284",
    email: "erintoth@gmail.com",
    password: "sammich"
  },
  "01938" : {
    id: "01938",
    email: "erin@erintoth.com",
    password: "super$#21pa$$"
  }
};

var errors = {
  '400': (request, response) => {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Not Found\n');
  },
  '403': (request, response) => {
    response.statusCode = 403;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Forbidden\n');
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
  let templateVars = { urls: urlDatabase, user: fetchUser(request.cookies["user_id"])};
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = { urls: urlDatabase, user: fetchUser(request.cookies["user_id"]) };
  user = fetchUser(request.cookies["user_id"]);
  if (user) {
  response.render("urls_new", templateVars);
  } else {
  response.redirect('/login');
  }
});

app.get("/register", (request, response) => {
  let templateVars = { urls: urlDatabase, user: fetchUser(request.cookies["user_id"]) };
  response.render("user_reg", templateVars);
});

app.get("/login", (request, response) => {
  let templateVars = { urls: urlDatabase, user: fetchUser(request.cookies["user_id"]) };
  response.render("user_login", templateVars);
});

app.post("/register", (request, response) => {
  let newUserEmail = request.body.email;
  let newUserPass = request.body.password;
  if (newUserEmail && newUserPass) {
    for (let UserId in users) {
      if (users[UserId].email === newUserEmail) {
      errors['400'](request, response);
      } else {
      let newUserId = (generateRandomString (1, 62)).toString();
      users[newUserId] = { id: newUserId, email: newUserEmail, password: newUserPass };
      response.cookie('user_id', newUserId);
      // response.redirect('/urls');
      }
    }
  } else {
      errors['400'](request,response);
  }
  response.redirect('/urls');
});

app.post("/urls", (request, response) => {
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
  const index = urlDatabase.indexOf(id);
  for (let item of urlDatabase) {
    if (item.shortURL === id) {
      urlDatabase.splice(index - 1, 1);
    }
  }
  response.redirect('/urls');
});

app.post("/login", (request, response) => {
  let password = request.body.password;
  let email = request.body.email;
  // const userId = users.;
  for (let userId in users) {
    if (users[userId].email === email && users[userId].password === password) {
      response.cookie('user_id', userId);
    }
    if (users[userId].email === email && users[userId].password !== password) {
      errors['403'](request,response);
    } else {
      errors['403'](request,response);
    }
    console.log(email);
    console.log(password);
  }
  // console.log(request.cookies["user_id"]);
  response.redirect("/");
});

app.post("/logout", (request, response) => {
  response.clearCookie('user_id');
  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  const userCID = request.cookies['user_id'];
  let templateVars = { shortURL: request.params.id, fullURL: urlDatabase, user: fetchUser(request.cookies["user_id"])};
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

function fetchUser(user_id) {
  const userObject = users[user_id];
  return userObject;
};

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

