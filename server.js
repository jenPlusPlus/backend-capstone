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
  const queryParameter = Object.keys(request.query)[0];
  const queryParameterValue = request.query[queryParameter];

  if (!queryParameter) {
    database('users').select()
      .then(users => response.status(200).json({ users }))
      .catch(error => response.status(500).json({ error }));
  } else {
    database('users').where(queryParameter.toLowerCase(), queryParameterValue.toLowerCase()).select()
      .then(users => {
        if (!users.length) {
          return response.status(404).json({ error: `Could not find any users associated with '${queryParameter}' of '${queryParameterValue}'` });
        }
        return response.status(200).json({ users });
      })
      .catch(error => response.status(500).json({ error }));
  }
});
// end /users

// begin /professionals
app.get('/api/v1/professionals', (request, response) => {
  const queryParameter = Object.keys(request.query)[0];
  const queryParameterValue = request.query[queryParameter];

  if (!queryParameter) {
    database('professionals').select()
      .then(professionals => response.status(200).json({ professionals }))
      .catch(error => response.status(500).json({ error }));
  } else {
    database('professionals').where(queryParameter.toLowerCase(), queryParameterValue.toLowerCase()).select()
      .then(professionals => {
        if (!professionals.length) {
          return response.status(404).json({ error: `Could not find any professionals associated with '${queryParameter}' of '${queryParameterValue}'` });
        }
        return response.status(200).json({ professionals });
      })
      .catch(error => response.status(500).json({ error }));
  }
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

app.delete('api/v1/users/:userID', (request, response) => {
  const userID = request.params.userID;

  database('users').where('id', userID).del()
    .then(() => response.status(204).json( { userID }))
    .catch(() => response.status(404).json({ error: `Could not find user with id '${userID}'` }));
});
// end /users/:userID

// begin /professionals/:professionalID
app.delete('api/v1/professionals/:professionalID', (request, response) => {
  const professionalID = request.params.professionalID;

  database('professionals').where('id', professionalID).del()
    .then(() => response.status(204).json( { professionalID }))
    .catch(() => response.status(404).json({ error: `Could not find professional with id '${professionalID}'` }));
});
// end /professionals/:professionalID

// begin /insuranceProviders/:insuranceProviderID
app.delete('api/v1/insuranceProviders/:insuranceProviderID', (request, response) => {
  const insuranceProviderID = request.params.insuranceProviderID;

  database('insuranceProviders').where('id', insuranceProviderID).del()
    .then(() => response.status(204).json( { insuranceProviderID }))
    .catch(() => response.status(404).json({ error: `Could not find insurance provider with id '${insuranceProviderID}'` }));
});
// end /insuranceProviders/:insuranceProviderID

// begin /specialties/:specialtyID
app.delete('api/v1/specialties/:specialtyID', (request, response) => {
  const specialtyID = request.params.specialtyID;

  database('specialties').where('id', specialtyID).del()
    .then(() => response.status(204).json( { specialtyID }))
    .catch(() => response.status(404).json({ error: `Could not find specialty with id '${specialtyID}'` }));
});
// end /specialties/:specialtyID

// begin /challenges/:challengeID
app.delete('api/v1/challenges/:challengeID', (request, response) => {
  const challengeID = request.params.challengeID;

  database('challenges').where('id', challengeID).del()
    .then(() => response.status(204).json( { challengeID }))
    .catch(() => response.status(404).json({ error: `Could not find challenge with id '${challengeID}'` }));
});
// end /challenges/:challengeID

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

// begin /favoriteUsers/:userID/:favoriteUserID
app.delete('/api/v1/favoriteUsers/:userID/:favoriteUserID', (request, response) => {
  const userID = request.params.userID;
  const favoriteUserID = request.params.favoriteUserID;

  database('favorite_users').where({
    user_id: userID,
    favorite_user_id: favoriteUserID
  }).del()
    .then(() => response.status(204).json( { favoriteUserID }))
    .catch(() => response.status(404).json({ error: `Could not find favorite user with id '${favoriteUserID}' for user id ${userID}` }));
});
// end /favoriteUsers/:userID/:favoriteUserID

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

// begin /favoriteProfessionals/:userID/:favoriteProfessionalID
app.delete('/api/v1/favoriteProfessionals/:userID/:favoriteProfessionalID', (request, response) => {
  const userID = request.params.userID;
  const favoriteProfessionalID = request.params.favoriteProfessionalID;

  database('favorite_professionals').where({
    user_id: userID,
    favorite_professional_id: favoriteProfessionalID
  }).del()
    .then(() => response.status(204).json( { favoriteProfessionalID }))
    .catch(() => response.status(404).json({ error: `Could not find favorite professional with id '${favoriteProfessionalID}' for user id ${userID}` }));
});
// end /favoriteProfessionals/:userID/:favoriteProfessionalID

app.listen(app.get('port'), () => {
  // eslint-disable-next-line
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});
