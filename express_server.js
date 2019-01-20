const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.set('view engine', 'ejs');

// Setting objects for urlDatabase for URLs after they're added, and users for registered users
// Commenting out hard coded entries, leaving them there in case required for testing.
const urlDatabase = {
  // "b2xVn2": {
    // shortURL: "b2xVn2",
    // fullURL: "http://www.lighthouselabs.ca",
    // userID: "59284"
  // },
  // "9sm5xK": {
    // shortURL: "9sm5xK",
    // fullURL: "http://www.google.com",
    // userID: "01938"
  // }
};

// Hard coded users work for testing ownership, but passwords are not secure and hence do not work.
const users = {
  // "59284" : {
    // id: "59284",
    // email: "cat@cat.com",
    // password: "cat"
  // },
  // "01938" : {
    // id: "01938",
    // email: "erin@erintoth.com",
    // password: "super$#21pa$$"
  // }
};

app.get('/', (request, response) => {
  if (request.session.user_id) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

app.get('/urls', (request, response) => {
  if (request.session.user_id) {
    let templateVars = {
      user: fetchUser(request.session.user_id),
      urls: urlsForUser(request.session.user_id)
    };
    response.render('urls_index', templateVars);
  } else {
    response.send('You must login to see your URLs! <a href=/login>Login</a> to see your links!');
  }
});

app.get('/urls/new', (request, response) => {
  if (request.session.user_id) {
    let templateVars = {
      urls: urlsForUser(request.session.user_id),
      user: fetchUser(request.session.user_id)
    };
    response.render('urls_new', templateVars);
  } else {
    response.redirect('/login');
  }
});


app.get('/urls/:id', (request, response) => {
  if (request.session.user_id) {
      if (checkShortUrl(request.params.id)) {
        if (checkOwner(request.session.user_id)) {
          let templateVars = {
          urls: urlByShort(request.params.id),
          user: fetchUser(request.session.user_id)
          };
        response.render('urls_show', templateVars);
        } else {
          response.send('You do not own this URL. Please go <a href=/urls/new>make your own</a>');
        }

      } else {
        response.send('This is not a valid shortURL! Please go <a href=/urls/new>make one</a>');
      };
  } else {
    response.status(403).send('Please <a href=/login>login</a> to access this page');
  }
});

app.get('/u/:shortURL', (request, response) => {
  if (checkShortUrl(request.params.shortURL)) {
    response.redirect(fetchLongUrl(request.params.shortURL));
  } else {
    response.send('I\'m sorry, that isn\'t a valid redirection link. Please go <a href=/urls/new>make one</a>');
  }
});

app.post('/urls', (request, response) => {
  if (request.session.user_id) {
    let newShort = generateRandomString (1, 62);
    urlDatabase[newShort] = {
      shortURL: newShort,
      fullURL: request.body.longURL,
      userID: request.session.user_id
    };
    let redirectLink = `/urls/${newShort}`;
    response.redirect(redirectLink);
  } else {
      response.status(403).send('Please <a href=/login>login</a> to access this page');
    }
});

app.put('/urls/:id', (request, response) => {
  if (request.session.user_id) {
    if (checkShortUrl(request.params.id)) {
      if (checkOwnerLong(request.session.user_id, request.params.id)) {
        urlDatabase[request.params.id].fullURL = request.body.newLongURL;
        response.redirect('/urls');
      } else {
        reponse.send('You do not own this URL. Please go <a href=/urls/new>make your own</a>');
      }
    }
  } else {
    response.status(403).send('Please <a href=/login>login</a> to access this page');
  }
});

app.delete('/urls/:id/delete', (request, response) => {
  if (request.session.user_id) {
    if (checkOwnerLong(request.session.user_id, request.params.id)){
      delete urlDatabase[request.params.id];
      response.redirect('/urls');
    } else {
      response.send('You do not own this URL. Please go <a href=/urls/new>make your own</a>');
    }
  } else {
    response.status(403).send('Please <a href=/login>login</a> to access this page');
  }
});

app.get('/login', (request, response) => {
  if (request.session.user_id) {
    response.redirect('/urls');
  } else {
    let templateVars = {
      user : fetchUser(request.session.user_id)
    };
    response.render('user_login', templateVars);
  }
});

app.get('/register', (request, response) => {
  if (request.session.user_id) {
    let templateVars = {
      urls: urlsForUser(request.session.user_id),
      user: fetchUser(request.session.user_id)
    };
    response.redirect('/urls');
  } else {
    let templateVars = {
      user : fetchUser(request.session.user_id)
    };
    response.render('user_reg', templateVars);
  }
});

app.post('/login', (request, response) => {
  if (checkPassword(request.body.email, request.body.password)) {
    request.session.user_id = fetchUserIdByEmail(request.body.email);
    response.redirect('/urls');
  } else {
    response.status(403).send('Please <a href=/login>try again</a> - your password or e-mail are not correct');
  }
});

app.post('/register', (request, response) => {
  if (!request.body.email || !request.body.password) {
    response.send('Please <a href=/register>try again</a> and enter an email and password');
  } else {
      if (checkEmailTaken(request.body.email)) {
        response.send('Sorry! Email already taken. Please <a href=/login>try again</a>');
      } else {
        request.session.user_id = generateRandomString(1, 62);
        users[request.session.user_id] = {
          id: request.session.user_id,
          email: request.body.email,
          password: bcrypt.hashSync(request.body.password, 10)
        };
        response.redirect('/urls');
      }
  }
});

app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Erin's TinyApp is now listening on port ${PORT}!`);
});

// Using the user_id supplied by the cookie this function returns an object containing
// the user's registration data.
function fetchUser(user_id) {
  const userObject = users[user_id];
  return userObject;
};

// Using the email supplied by the user via the form this function returns a string
// containing the matching userID.
function fetchUserIdByEmail(email) {
  let user_id = '';
  for (let user in users) {
    if (users[user].email === email) {
      user_id = users[user].id;
    }
  }
  return user_id;
};

// Using the shortURL supplied by the user this function returns an object containing
// all of saved data matching that request.
function urlByShort(shortURL) {
  let urlsObj = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].shortURL === shortURL) {
      urlsObj = urlDatabase[item];
    }
  }
  return urlsObj;
};

// Using the user_id supplied by the cookie this function returns an array containing
// all of the urls "owned" by that user.
function urlsForUser(user_id) {
  let urlsArray = [];
  for (let item in urlDatabase) {
    if (user_id === urlDatabase[item].userID) {
      urlsArray.push(urlDatabase[item]);
    }
  }
 return urlsArray;
};

// Using the email supplied by the user this function returns a boolean response of
// true if the email matches one already saved in the users object.
function checkEmailTaken(email){
  let flag = false;
  for (let user in users) {
    if(users[user].email === email){
      flag = true;
    }
  }
  return flag;
};

// Using the shortURL supplied by the user this function returns a boolean response of
// true if the shortURL matches one already saved in the urlDatabase object.
function checkShortUrl(shortURL) {
  let flag = false;
  for (let url in urlDatabase) {
    if(urlDatabase[url].shortURL === shortURL){
      flag = true;
    }
  }
  return flag;
};

// Using the shortURL supplied by the user this function returns the longURL associated
// with that shortURL.
function fetchLongUrl(shortURL) {
  let longURL = '';
  for (let url in urlDatabase) {
    if (urlDatabase[url].shortURL === shortURL) {
      longURL = urlDatabase[url].fullURL;
    }
  }
  return longURL;
};

// Using the user_id supplied by the cookie this function returns a boolean response of
// true if the user_id currently signed in matches a user_id within the database.
function checkOwner(user_id) {
  let flag = false;
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
      flag = true;
    }
  }
  return flag;
};

// Using the user_id supplied by the cookie and the shortURL supplied by the user this
// function returns a boolean response of true if the signed in user "owns" the shortURL
// they are attempting to access.
function checkOwnerLong(user_id, shortURL) {
  let flag = false;
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user_id && urlDatabase[url].shortURL === shortURL) {
      flag = true;
    }
  }
  return flag;
};

// Using the email and password supplied by the user this function returns a boolean
// response of true if the email and password match those associated with the user.
function checkPassword(email, password) {
  let flag = false;
  for (let user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        flag = true;
      }
    }
  }
  return flag;
};

// When supplied with 1 and 62 this function returns a six digit pseudo-random code
// to associate with a new user or new url addition.
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

