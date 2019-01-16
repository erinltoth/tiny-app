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

app.post("/urls", (request, response) => {
  console.log(request.body);
  const newShort = generateRandomString (1, 62);
  const newLong = Object.values(request.body);
  let newRequest = {shortURL: newShort, fullURL: newLong.join()};
  urlDatabase.push(newRequest);
  console.log(urlDatabase);
  let redirectLink = `/urls/${newShort}`;
  console.log(redirectLink);
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

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, fullURL: urlDatabase };
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

