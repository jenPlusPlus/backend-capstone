const express = require('express');
// will this be necessary? see app.use(express.static)
// const path = require('path');

const app = express();
require('express-async-await')(app);
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
    // returns one item for each entry in user_challenges instead of one item per user in users,
    // each with an array of challenges
    database('users')
      // .join('user_challenges', 'users.id', '=', 'user_challenges.user_id')
      // .join('challenges', 'challenges.id', 'user_challenges.challenge_id')
      // .select('users.*', 'challenges.challenge_name')
      // .then(users => response.status(200).json({ users }))
      .leftJoin('user_challenges', 'users.id', '=', 'user_challenges.user_id')
      .leftJoin('challenges', 'challenges.id', '=', 'user_challenges.challenge_id')
      .select('users.*', 'challenges.challenge_name')
      .then(users => {
        // console.log('users: ', users);
        if (users.length) {
          // let completeUser = {user_challenges: []};
          let allCompleteUsers =[];
          users.forEach(user => {

            const completeUserIndex = allCompleteUsers.findIndex(completeUser => {
              return completeUser.id === user.id;
            });
            if (completeUserIndex === -1) {
              allCompleteUsers.push({
                id: user.id,
                user_name: user.user_name,
                user_image: user.user_image,
                user_about: user.user_about,
                user_location: user.user_location,
                user_email: user.user_email,
                user_challenges: []
              });
              if (user.challenge_name) {
                allCompleteUsers[allCompleteUsers.length - 1].user_challenges.push(user.challenge_name);
              }
            } else {
              if (user.challenge_name) {
                allCompleteUsers[completeUserIndex].user_challenges.push(user.challenge_name);
              }
            }
          });

          return response.status(200).json({ users: allCompleteUsers });
        }
        return response.status(404).json({ error: `Could not find any user associated with id ${request.params.userID}.`});
      })
      .catch(error => response.status(500).json({ error }));
  } else {
    database('users').where(queryParameter.toLowerCase(), queryParameterValue).select()
      .then(users => {
        if (!users.length) {
          return response.status(404).json({ error: `Could not find any users associated with '${queryParameter}' of '${queryParameterValue}'` });
        }
        return response.status(200).json({ users });
      })
      .catch(error => response.status(500).json({ error }));
  }
});

app.post('/api/v1/users', (request, response) => {
  const { user_name, user_image, user_about, user_location, user_email, user_challenges } = request.body;
  const user = { user_name, user_image, user_about, user_location, user_email };
  let userID;
  let userChallengeIDPromises;
  let userChallengeIDs;

  for (const requiredParameter of ['user_name', 'user_about', 'user_location, user_email']) {
    if (!user[requiredParameter]) {
      return response.status(422).json( { error: `You are missing the '${requiredParameter}' property` });
    }
  }

  userChallengeIDPromises = user_challenges.map(challenge => {
    return database('challenges').where('challenge_name', challenge).select()
      .then(challenges => challenges.challenge_id)
      .catch(error => response.status(500).json({ error }));
  });

  Promise.all(userChallengeIDPromises)
    .then(resolvedChallengeIDs => {
      userChallengeIDs = resolvedChallengeIDs;
    })
    .catch(error => response.status(500).json({ error }));

  database('users').insert(user, 'id')
    .then(insertedUserID => {
      userID = insertedUserID;
      response.status(201).json({ id: insertedUserID });
    })
    .catch(error => response.status(500).json({ error }));

  const userChallenges = userChallengeIDs.map(userChallengeID => {
    return {
      user_id: userID,
      challenge_id: userChallengeID
    };
  });

  database('user_challenges').insert(userChallenges)
    .then(insertedUserChallenge => response.status(201).json({ userChallenge: insertedUserChallenge }))
    .catch(error => response.status(500).json({ error }));
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
    database('professionals').where(queryParameter.toLowerCase(), queryParameterValue).select()
      .then(professionals => {
        if (!professionals.length) {
          return response.status(404).json({ error: `Could not find any professionals associated with '${queryParameter}' of '${queryParameterValue}'` });
        }
        return response.status(200).json({ professionals });
      })
      .catch(error => response.status(500).json({ error }));
  }
});

app.post('/api/v1/professionals', (request, response) => {
  const { professional_name, professional_image, professional_location, professional_specialties, professional_insuranceProviders } = request.body;
  const professional = { professional_name, professional_image, professional_location };
  let profID;
  let specialtyIDPromises;
  let specialtyIDs;
  let insuranceProviderIDPromises;
  let insuranceProvidersIDs;

  for (const requiredParameter of ['professional_name', 'professional_location', 'professional_specialties', 'professional_insuranceProviders']) {
    if (!professional[requiredParameter]) {
      return response.status(422).json( { error: `You are missing the '${requiredParameter}' property` });
    }
  }

  specialtyIDPromises = professional_specialties.map(specialty => {
    return database('specialties').where('specialty_name', specialty).select()
      .then(specialties => specialties.specialty_id)
      .catch(error => response.status(500).json({ error }));
  });

  Promise.all(specialtyIDPromises)
    .then(resolvedSpecialtyIDs => {
      specialtyIDs = resolvedSpecialtyIDs;
    })
    .catch(error => response.status(500).json({ error }));

  insuranceProviderIDPromises = professional_insuranceProviders.map(insuranceProvider => {
    return database('insurance_providers').where('insuranceProvider_name', insuranceProvider).select()
      .then(insuranceProviders => insuranceProviders.insuranceProvider_id)
      .catch(error => response.status(500).json({ error }));
  });

  Promise.all(insuranceProviderIDPromises)
    .then(resolvedinsuranceProviderIDs => {
      insuranceProvidersIDs = resolvedinsuranceProviderIDs;
    })
    .catch(error => response.status(500).json({ error }));

  database('professionals').insert(professional, 'id')
    .then(insertedProfessionalID => {
      profID = insertedProfessionalID;
      return response.status(201).json({ id: insertedProfessionalID });
    })
    .catch(error => response.status(500).json({ error }));

  const professionalSpecialties = specialtyIDs.map(specialtyID => {
    return {
      professional_id: profID,
      specialty_id: specialtyID
    };
  });

  database('professional_specialties').insert(professionalSpecialties)
    .then(insertedProfessionalSpecialty => response.status(201).json({ professionalSpecialty: insertedProfessionalSpecialty }))
    .catch(error => response.status(500).json({ error }));

  const professionalInsuranceProviders = insuranceProvidersIDs.map(insuranceProviderID => {
    return {
      professional_id: profID,
      insuranceProvider_id: insuranceProviderID
    };
  });

  database('professional_insuranceProviders').insert(professionalInsuranceProviders)
    .then(insertedProfessionalInsuranceProvider => response.status(201).json({ professionalInsuranceProvider: insertedProfessionalInsuranceProvider }))
    .catch(error => response.status(500).json({ error }));

});
// end /professionals

// begin /insuranceProviders
app.get('/api/v1/insuranceProviders', (request, response) => {
  database('insurance_providers').select()
    .then(insuranceProviders => response.status(200).json({ insuranceProviders }))
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/insuranceProviders', (request, response) => {
  const { insuranceProvider_name } = request.body;
  const insuranceProvider = { insuranceProvider_name };

  for (const requiredParameter of ['specialty_name']) {
    if (!insuranceProvider[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('insurance_providers').insert(insuranceProvider, 'id')
    .then(insertedInsuranceProviderID => response.status(201).json({ id: insertedInsuranceProviderID }))
    .catch(error => response.status(500).json({ error }));
});
// end /insuranceProviders

// begin /specialties
app.get('/api/v1/specialties', (request, response) => {
  database('specialties').select()
    .then(specialties => response.status(200).json({ specialties }))
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/specialties', (request, response) => {
  const { specialty_name } = request.body;
  const specialty = { specialty_name };

  for (const requiredParameter of ['specialty_name']) {
    if (!specialty[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('specialties').insert(specialty, 'id')
    .then(insertedSpecialtyID => response.status(201).json({ id: insertedSpecialtyID }))
    .catch(error => response.status(500).json({ error }));
});
// end /specialties

// begin /challenges
app.get('/api/v1/challenges', (request, response) => {
  database('challenges').select()
    .then(challenges => response.status(200).json({ challenges }))
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/challenges', (request, response) => {
  const { challenge_name } = request.body;
  const challenge = { challenge_name };

  for (const requiredParameter of ['specialty_name']) {
    if (!challenge[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('challenges').insert(challenge, 'id')
    .then(insertedChallengeID => response.status(201).json({ id: insertedChallengeID }))
    .catch(error => response.status(500).json({ error }));
});
// end /challenges

// begin /users/:userID
app.get('/api/v1/users/:userID', (request, response) => {
  // will return 404 if user id does not exist in user_challenges
  database('users')
    .where('users.id', request.params.userID)
    .leftJoin('user_challenges', 'users.id', '=', 'user_challenges.user_id')
    .leftJoin('challenges', 'challenges.id', '=', 'user_challenges.challenge_id')
    .select('users.*', 'challenges.challenge_name')
    .then(users => {
      if (users.length) {
        let completeUser = {user_challenges: []};
        users.forEach(user => {
          if (user.challenge_name) {
            completeUser.user_challenges.push(user.challenge_name);
          }
        });
        Object.assign(completeUser, {
          id: users[0].id,
          user_name: users[0].user_name,
          user_image: users[0].user_image,
          user_about: users[0].user_about,
          user_location: users[0].user_location,
          user_email: users[0].user_email
        });
        return response.status(200).json({ user: completeUser });
      }
      return response.status(404).json({ error: `Could not find any user associated with id ${request.params.userID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/users/:userID', (request, response) => {
  const userID = request.params.userID;

  database('users').where('id', userID).del()
    .then(() => response.status(204).json( { userID }))
    .catch(() => response.status(404).json({ error: `Could not find user with id '${userID}'` }));
});
// end /users/:userID

// begin /professionals/:professionalID
app.get('/api/v1/professionals/:professionalID', (request, response) => {
  database('professionals').where('id', request.params.professionalID).select()
    .then(professionals => {
      if (professionals.length) {
        return response.status(200).json({ professional: professionals[0] });
      }
      return response.status(404).json({ error: `Could not find any professional associated with id ${request.params.professionalID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/professionals/:professionalID', (request, response) => {
  const professionalID = request.params.professionalID;

  database('professionals').where('id', professionalID).del()
    .then(() => response.status(204).json( { professionalID }))
    .catch(() => response.status(404).json({ error: `Could not find professional with id '${professionalID}'` }));
});
// end /professionals/:professionalID

// begin /insuranceProviders/:insuranceProviderID
app.get('/api/v1/insuranceProviders/:insuranceProviderID', (request, response) => {
  database('insurance_providers').where('id', request.params.insuranceProviderID).select()
    .then(insuranceProviders => {
      if (insuranceProviders.length) {
        return response.status(200).json({ insuranceProvider: insuranceProviders[0] });
      }
      return response.status(404).json({ error: `Could not find any insurance provider associated with id ${request.params.insuranceProviderID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/insuranceProviders/:insuranceProviderID', (request, response) => {
  const insuranceProviderID = request.params.insuranceProviderID;

  database('insurance_providers').where('id', insuranceProviderID).del()
    .then(() => response.status(204).json( { insuranceProviderID }))
    .catch(() => response.status(404).json({ error: `Could not find insurance provider with id '${insuranceProviderID}'` }));
});
// end /insuranceProviders/:insuranceProviderID

// begin /specialties/:specialtyID
app.get('/api/v1/specialties/:specialtyID', (request, response) => {
  database('specialties').where('id', request.params.specialtyID).select()
    .then(specialties => {
      if (specialties.length) {
        return response.status(200).json({ specialty: specialties[0] });
      }
      return response.status(404).json({ error: `Could not find any specialty associated with id ${request.params.specialtyID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/specialties/:specialtyID', (request, response) => {
  const specialtyID = request.params.specialtyID;

  database('specialties').where('id', specialtyID).del()
    .then(() => response.status(204).json( { specialtyID }))
    .catch(() => response.status(404).json({ error: `Could not find specialty with id '${specialtyID}'` }));
});
// end /specialties/:specialtyID

// begin /challenges/:challengeID
app.get('/api/v1/challenges/:challengeID', (request, response) => {
  database('challenges').where('id', request.params.challengeID).select()
    .then(challenges => {
      if (challenges.length) {
        return response.status(200).json({ challenge: challenges[0] });
      }
      return response.status(404).json({ error: `Could not find any challenge associated with id ${request.params.challengeID}.`});
    })
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/challenges/:challengeID', (request, response) => {
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

app.post('/api/v1/favoriteUsers/:userID', (request, response) => {
  const { favoriteUserID } = request.body;
  const favoriteUser = { favoriteUserID };

  const { userID } = request.params;

  for (const requiredParameter of ['favoriteUserID']) {
    if (!favoriteUser[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('favorite_users').insert({
    user_id: userID,
    favorite_user_id: favoriteUserID
  }, '*')
    .then(insertedFavoriteUser => response.status(201).json({ favoriteUser: insertedFavoriteUser }))
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

app.post('/api/v1/favoriteProfessionals/:userID', (request, response) => {
  const { favoriteProfessionalID } = request.body;
  const favoriteProfessional = { favoriteProfessionalID };

  const { userID } = request.params;

  for (const requiredParameter of ['favoriteProfessionalID']) {
    if (!favoriteProfessional[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('favorite_professionals').insert({
    user_id: userID,
    favorite_professional_id: favoriteProfessionalID
  }, '*')
    .then(insertedFavoriteProfessional => response.status(201).json({ favoriteProfessional: insertedFavoriteProfessional }))
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
