const express = require('express');
// will this be necessary? see app.use(express.static)
// const path = require('path');

const app = express();
const bodyParser = require('body-parser');

// set up for future use
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

app.set('port', process.env.PORT || 3000);

// set up for future use
// app.set('secretKey', process.env.SECRET_KEY);

// change title when we've decided on application name
app.locals.title = 'Capstone';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

// this would usually serve HTML from the public folder
// how do we change it to serve files from our other repo?
// app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (request, response) => {
  response.send(`It's the backend!`);
});

// begin /users
app.get('/api/v1/users', (request, response) => {
  database('users').select()
    .then(users => response.status(200).json({ users }))
    .catch(error => response.status(500).json({ error }));
});
// end /users

// begin /professionals
app.get('/api/v1/professionals', (request, response) => {
  database('professionals').select()
    .then(professionals => response.status(200).json({ professionals }))
    .catch(error => response.status(500).json({ error }));
});
// end /professionals

// begin /insuranceProviders
app.get('/api/v1/insuranceProviders', (request, response) => {
  database('insuranceProviders').select()
    .then(insuranceProviders => response.status(200).json({ insuranceProviders }))
    .catch(error => response.status(500).json({ error }));
});
// end /insuranceProviders

// begin /specialties
app.get('/api/v1/specialties', (request, response) => {
  database('specialties').select()
    .then(specialties => response.status(200).json({ specialties }))
    .catch(error => response.status(500).json({ error }));
});
// end /specialties

// begin /challenges
app.get('/api/v1/challenges', (request, response) => {
  database('challenges').select()
    .then(challenges => response.status(200).json({ challenges }))
    .catch(error => response.status(500).json({ error }));
});
// end /challenges

// begin /users/:userID
app.get('/api/v1/users/:userID', (request, response) => {
  database('users').where('id', request.params.userID).select()
    .then(user => {
      if (user.length) {
        return response.status(200).json({ user: user[0] });
      }
      return response.status(404).json({ error: `Could not find any user associated with id ${request.params.userID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});
// end /users/:userID

// begin /favoriteUsers/:userID
app.get('/api/v1/favoriteUsers/:userID', (request, response) => {
  database('favorite_users').where('user_id', request.params.userID).select()
    .then(favoriteUsers => {
      if (favoriteUsers.length) {
        return response.status(200).json({ favoriteUsers: favoriteUsers[0] });
      }
      return response.status(404).json({ error: `Could not find any favorite users for user id ${request.params.userID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});
// end /favoriteUsers/:userID

// begin /favoriteProfessionals/:userID
app.get('/api/v1/favoriteProfessionals/:userID', (request, response) => {
  database('favorite_professionals').where('user_id', request.params.userID).select()
    .then(favoriteProfessionals => {
      if (favoriteProfessionals.length) {
        return response.status(200).json({ favoriteUsers: favoriteProfessionals[0] });
      }
      return response.status(404).json({ error: `Could not find any favorite professionals for user id ${request.params.userID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});
// end /favoriteProfessionals/:userID

app.listen(app.get('port'), () => {
  // eslint-disable-next-line
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});
