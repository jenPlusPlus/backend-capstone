const express = require('express');
// will this be necessary? see app.use(express.static)
// const path = require('path');

const app = express();
const cors = require('express-cors');
const bodyParser = require('body-parser');

// set up for future use
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

app.set('port', process.env.PORT || 3000);

// set up for future use
// app.set('secretKey', process.env.SECRET_KEY);

app.locals.title = 'Mental Healthy Backend';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'HEAD, GET, OPTIONS, PATCH, DELETE, POST');
  next();
});

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

// this would usually serve HTML from the public folder
// how do we change it to serve files from our other repo?
// app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (request, response) => {
  response.send(`It's the backend!`);
});

const getProfessionalInsSpec = (profIDs) => {
  const promiseArray = profIDs.map(profID => {
    return database('professionals')
      .where('professionals.id', profID)
      .leftJoin('professional_specialties', 'professionals.id', '=', 'professional_specialties.professional_id')
      .leftJoin('specialties', 'specialties.id', '=', 'professional_specialties.specialty_id')
      .leftJoin('professional_insurance_providers', 'professionals.id', '=', 'professional_insurance_providers.professional_id')
      .leftJoin('insurance_providers', 'insurance_providers.id', '=', 'professional_insurance_providers.insurance_provider_id')
      .select('professionals.*', 'insurance_providers.insurance_provider_name', 'specialties.specialty_name');
  });

  return Promise.all(promiseArray).then(results => {

    const populatedResults = results.filter(item => item.length > 0);
    if (populatedResults.length > 0) {
      const cleanedResults = results.map(singleProfArray => {
        const professional = Object.assign({}, {
          id: singleProfArray[0].id,
          professional_name: singleProfArray[0].professional_name,
          professional_image: singleProfArray[0].professional_image,
          professional_location: singleProfArray[0].professional_location,
          professional_email: singleProfArray[0].professional_email,
          professional_phone: singleProfArray[0].professional_phone,
          professional_insurance_providers: [],
          professional_specialties: []
        });
        const allSpecialtyNames = singleProfArray.map(prof => prof.specialty_name);
        const cleanedSpecialtyNames = allSpecialtyNames.filter(specialtyName => specialtyName !== null);
        const uniqueSpecialtyNames = Array.from(new Set(cleanedSpecialtyNames));
        professional.professional_specialties = uniqueSpecialtyNames;

        const allInsuranceNames = singleProfArray.map(prof => prof.insurance_provider_name);
        const cleanedInsuranceNames = allInsuranceNames.filter(insuranceName => insuranceName !== null);
        const uniqueInsuranceNames = Array.from(new Set(cleanedInsuranceNames));
        professional.professional_insurance_providers = uniqueInsuranceNames;

        return professional;
      });
      return cleanedResults;
    }
  });

};

const getUsersAndChallenges = (userIds) => {

  const promiseArray = userIds.map(userId =>
    database('users')
      .where('users.id', userId)
      .leftJoin('user_challenges', 'users.id', '=', 'user_challenges.user_id')
      .leftJoin('challenges', 'challenges.id', '=', 'user_challenges.challenge_id')
      .select('users.*', 'challenges.challenge_name')
  );

  return Promise.all(promiseArray).then(results => {
    const populatedResults = results.filter(item => item.length > 0);
    if (populatedResults.length > 0) {
      const cleanedResults = results.map(singleUserArray => {
        const user = Object.assign({}, {
          id: singleUserArray[0].id,
          user_name: singleUserArray[0].user_name,
          user_image: singleUserArray[0].user_image,
          user_about: singleUserArray[0].user_about,
          user_location: singleUserArray[0].user_location,
          user_email: singleUserArray[0].user_email,
          user_challenges: []
        });
        const allChallengeNames = singleUserArray.map(user => user.challenge_name);
        const cleanedChallengeNames = allChallengeNames.filter(challengeName => challengeName !== null);
        user.user_challenges = cleanedChallengeNames;

        return user;
      });
      return cleanedResults;
    }
  });
};

// begin /users
app.get('/api/v1/users', (request, response) => {
  const queryParameter = Object.keys(request.query)[0];
  const queryParameterValue = request.query[queryParameter];

  if (!queryParameter) {
    database('users')
      .leftJoin('user_challenges', 'users.id', '=', 'user_challenges.user_id')
      .leftJoin('challenges', 'challenges.id', '=', 'user_challenges.challenge_id')
      .select('users.*', 'challenges.challenge_name')
      .then(users => {
        if (users.length) {
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
        return response.status(404).json({ error: `Could not find any users.`});
      })
      .catch(error => response.status(500).json({ error }));
  } else {
    // if there's a query
    if (queryParameter.toLowerCase() === 'user_challenge') {
      // query is challenges
      database('challenges')
        .where('challenge_name', queryParameterValue)
        .select('id')
        .then(challengeID => {
          database('user_challenges')
            .where('challenge_id', challengeID[0].id)
            .select('user_id')
            .then(usersWithChallenges => {
              if (usersWithChallenges.length > 0) {
                const userIdArray = usersWithChallenges.map(userObject => userObject.user_id);
                getUsersAndChallenges(userIdArray)
                  .then(usersAndChallenges => {
                    return response.status(200).json({ users: usersAndChallenges });
                  });
              } else {

                return response.status(404).json({ error: `Could not find any users associated with '${queryParameter}' of '${queryParameterValue}'` });
              }
            }) // end user_challenges then
            .catch(error => response.status(500).json({ error }));
        })
        .catch(error => response.status(500).json({ error }));

    } else {
    // query is not challenge
      database('users')
        .where(queryParameter.toLowerCase(), queryParameterValue)
        .select()
        .then(users => {
          if (!users.length) {
            return response.status(404).json({ error: `Could not find any users associated with '${queryParameter}' of '${queryParameterValue}'` });
          }
          const queryUserIDs = users.map(user => user.id);
          getUsersAndChallenges(queryUserIDs)
            .then(usersAndChallenges => {
              return response.status(200).json({ users: usersAndChallenges });
            });
        })
        .catch(error => response.status(500).json({ error }));
    }
  }
});

app.post('/api/v1/users', (request, response) => {
  const { user_name, user_image, user_about, user_location, user_email, user_challenges } = request.body;

  const user = { user_name, user_image, user_about, user_location, user_email };
  let userID;
  let userChallengeIDPromises = [];
  let userChallengeIDs = [];

  for (const requiredParameter of ['user_name']) {
    if (!user[requiredParameter]) {
      return response.status(422).json( { error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('users').insert(user, 'id')
    .then(insertedUserID => {
      userID = insertedUserID[0];

      if (user_challenges.length > 0) {
        userChallengeIDPromises = user_challenges.map(challenge => {
          return database('challenges').where('challenge_name', challenge).select('id')
            .catch(error => response.status(500).json({ error }));
        });


        Promise.all(userChallengeIDPromises)
          .then(resolvedChallengeIDs => {
            userChallengeIDs = resolvedChallengeIDs.reduce((acc, resChallengeID) => {
              acc.push(resChallengeID[0].id);
              return acc;
            }, []);
            return userChallengeIDs;
          })
          .then(results => {

            const userChallenges = results.map(userChallengeID => {
              return {
                user_id: userID,
                challenge_id: userChallengeID
              };
            });

            database('user_challenges').insert(userChallenges, '*')
              .then(insertedUserChallenges => {
                return response.status(201).json({ userChallenge: insertedUserChallenges });
              })
              .catch(error => response.status(500).json({ error }));

          })
          .catch(error => response.status(500).json({ error }));
      }

      return response.status(201).json({ id: insertedUserID[0] });
    })
    .catch(error => response.status(500).json({ error }));

});
// end /users

// begin /professionals
app.get('/api/v1/professionals', (request, response) => {
  const queryParameter = Object.keys(request.query)[0];
  const queryParameterValue = request.query[queryParameter];

  if (!queryParameter) {
    database('professionals')
      .leftJoin('professional_specialties', 'professionals.id', '=', 'professional_specialties.professional_id')
      .leftJoin('specialties', 'specialties.id', '=', 'professional_specialties.specialty_id')
      .leftJoin('professional_insurance_providers', 'professionals.id', '=', 'professional_insurance_providers.professional_id')
      .leftJoin('insurance_providers', 'insurance_providers.id', '=', 'professional_insurance_providers.insurance_provider_id')
      .select('professionals.*', 'insurance_providers.insurance_provider_name', 'specialties.specialty_name')
      .then(professionals => {

        if (professionals.length) {
          let allCompleteProfessionals = [];
          professionals.forEach(professional => {

            const completeProfessionalIndex = allCompleteProfessionals.findIndex(completeProfessional => {
              return completeProfessional.id === professional.id;
            });

            if (completeProfessionalIndex === -1 ) {
              allCompleteProfessionals.push({
                id: professional.id,
                professional_name: professional.professional_name,
                professional_image: professional.professional_image,
                professional_location: professional.professional_location,
                professional_email: professional.professional_email,
                professional_phone: professional.professional_phone,
                professional_insurance_providers: [],
                professional_specialties: []
              });

              if (professional.insurance_provider_name) {

                allCompleteProfessionals[allCompleteProfessionals.length - 1].professional_insurance_providers.push(professional.insurance_provider_name);
              }

              if (professional.specialty_name) {
                allCompleteProfessionals[allCompleteProfessionals.length - 1].professional_specialties.push(professional.specialty_name);
              }

            } else {
              if (professional.insurance_provider_name) {

                const providerIndex = allCompleteProfessionals[completeProfessionalIndex].professional_insurance_providers
                  .findIndex( provider => professional.insurance_provider_name === provider);

                if (providerIndex === -1) {
                  allCompleteProfessionals[completeProfessionalIndex].professional_insurance_providers.push(professional.insurance_provider_name);
                }

              }

              if (professional.specialty_name) {
                const specialtyIndex = allCompleteProfessionals[completeProfessionalIndex].professional_specialties
                  .findIndex( specialty => professional.specialty_name === specialty);

                if (specialtyIndex === -1) {
                  allCompleteProfessionals[completeProfessionalIndex].professional_specialties.push(professional.specialty_name);
                }
              }
            }
          });
          return response.status(200).json({ professionals: allCompleteProfessionals });
        }
        return response.status(404).json({ error: `Could not find any professionals.`});
      })
      .catch(error => response.status(500).json({ error }));
  } else {
    if (queryParameter.toLowerCase() === 'specialty') {

      database('specialties')
        .where('specialty_name', queryParameterValue)
        .select('id')
        .then(specialtyID => {

          database('professional_specialties')
            .where('specialty_id', specialtyID[0].id)
            .select('professional_id')
            .then(profsWithSpecialties => {
              if (profsWithSpecialties.length > 0) {
                const profIdArray = profsWithSpecialties.map(profObject => profObject.professional_id);

                getProfessionalInsSpec(profIdArray)
                  .then(profsInsSpec => {

                    return response.status(200).json({ professionals: profsInsSpec });
                  });
              } else {

                return response.status(404).json({ error: `Could not find any professionals associated with '${queryParameter}' of '${queryParameterValue}'` });
              }
            })
            .catch(error => response.status(500).json({ error }));
        })
        .catch(error => response.status(500).json({ error }));
    } else if (queryParameter.toLowerCase() === 'insurance_provider') {
      database('insurance_providers')
        .where('insurance_provider_name', queryParameterValue)
        .select('id')
        .then(insuranceID => {

          database('professional_insurance_providers')
            .where('insurance_provider_id', insuranceID[0].id)
            .select('professional_id')
            .then(profsWithInsurance => {
              if (profsWithInsurance.length > 0) {
                const profIdArray = profsWithInsurance.map(profObject => profObject.professional_id);

                getProfessionalInsSpec(profIdArray)
                  .then(profsInsSpec => {
                    return response.status(200).json({ professionals: profsInsSpec });
                  });
              } else {

                return response.status(404).json({ error: `Could not find any professionals associated with '${queryParameter}' of '${queryParameterValue}'` });
              }
            })
            .catch(error => response.status(500).json({ error }));
        })
        .catch(error => response.status(500).json({ error }));
    } else {
      // need to join with specialty & insurance
      database('professionals').where(queryParameter.toLowerCase(), queryParameterValue).select()
        .then(professionals => {
          if (!professionals.length) {
            return response.status(404).json({ error: `Could not find any professionals associated with '${queryParameter}' of '${queryParameterValue}'` });
          }
          return response.status(200).json({ professionals });
        })
        .catch(error => response.status(500).json({ error }));
    }
  }
});

app.post('/api/v1/professionals', (request, response) => {
  const {
    professional_name,
    professional_image,
    professional_location,
    professional_specialties,
    professional_insurance_providers,
    professional_email,
    professional_phone
  } = request.body;

  const professional = { professional_name, professional_image, professional_location, professional_email, professional_phone };
  let profID;
  let specialtyIDPromises = [];
  let specialtyIDs = [];
  let insuranceProviderIDPromises = [];
  let insuranceProvidersIDs = [];

  for (const requiredParameter of ['professional_name', 'professional_location']) {
    if (!professional[requiredParameter]) {
      return response.status(422).json( { error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('professionals').insert(professional, 'id')
    .then(insertedProfessionalID => {
      profID = insertedProfessionalID[0];

      if (professional_specialties.length > 0) {
        specialtyIDPromises = professional_specialties.map(specialty => {
          return database('specialties').where('specialty_name', specialty).select('id')
            .catch(error => response.status(500).json({ error }));
        });


        Promise.all(specialtyIDPromises)
          .then(resolvedSpecialtyIDs => {
            specialtyIDs = resolvedSpecialtyIDs.reduce((acc, resSpecialtyId) => {
              acc.push(resSpecialtyId[0].id);
              return acc;
            }, []);
            return specialtyIDs;
          })
          .then(results => {

            const profSpecialties = results.map(profSpecialtyID => {
              return {
                professional_id: profID,
                specialty_id: profSpecialtyID
              };
            });

            database('professional_specialties').insert(profSpecialties, '*')
              .then(insertedProfessionalSpecialty => response.status(201).json({ professionalSpecialty: insertedProfessionalSpecialty }))
              .catch(error => response.status(500).json({ error }));
          })
          .catch(error => response.status(500).json({ error }));
      }

      if (professional_insurance_providers.length > 0) {
        insuranceProviderIDPromises = professional_insurance_providers.map(insuranceProvider => {
          return database('insurance_providers').where('insurance_provider_name', insuranceProvider).select('id')
            .catch(error => response.status(500).json({ error }));
        });

        Promise.all(insuranceProviderIDPromises)
          .then(resolvedinsuranceProviderIDs => {
            insuranceProvidersIDs = resolvedinsuranceProviderIDs.reduce((acc, resInsuranceID) => {
              acc.push(resInsuranceID[0].id);
              return acc;
            }, []);
            return insuranceProvidersIDs;
          })
          .then(results => {
            const profInsurances = results.map(profInsuranceID => {
              return {
                professional_id: profID,
                insurance_provider_id: profInsuranceID
              };
            });
            database('professional_insurance_providers').insert(profInsurances, '*')
              .then(insertedProfessionalInsuranceProvider => {
                return response.status(201).json({ professionalInsuranceProvider: insertedProfessionalInsuranceProvider });
              })
              .catch(error => response.status(500).json({ error }));
          })
          .catch(error => response.status(500).json({ error }));

      }

      return response.status(201).json({ id: insertedProfessionalID });
    })
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
  const { insurance_provider_name } = request.body;
  const insuranceProvider = { insurance_provider_name };

  for (const requiredParameter of ['insurance_provider_name']) {
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

  for (const requiredParameter of ['challenge_name']) {
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
  getUsersAndChallenges([request.params.userID])
    .then(usersAndChallenges => {
      if (usersAndChallenges) {
        return response.status(200).json({ users: usersAndChallenges });
      } else {
        return response.status(404).json({ error: `Could not find any user associated with id ${request.params.userID}.`});
      }
    })
    .catch(error => response.status(500).json({ error }));

});

app.delete('/api/v1/users/:userID', (request, response) => {
  const userID = request.params.userID;

  database('users').where('id', userID).del()
    .then(() => response.status(204).json( { userID }))
    .catch(() => response.status(404).json({ error: `Could not find user with id '${userID}'` }));
});

app.patch('/api/v1/users/:userID', (request, response) => {
  const userID = request.params.userID;
  const { user_name, user_about, user_location, user_challenges } = request.body;
  const body = { user_name, user_about, user_location };


  const updateInUsersTable = () => {
    database('users').where('id', userID).update(body, '*')
      .then(user => {

        if (user.length > 0) {
          getUsersAndChallenges([userID])
            .then(usersAndChallenges => {
              return response.status(202).json({ user: usersAndChallenges[0] });
            })
            .catch(error => response.status(500).json({ error }));
        } else {
          return response.status(404).json({ error: `Could not find any user associated with id ${userID}` });
        }
      })
      .catch(error => response.status(500).json({ error }));
  };

  if (user_challenges) {

    database('user_challenges').where('user_id', userID).del().catch(error => response.status(500).json({ error }));

    const userChallengePromises = user_challenges.map(challenge => {
      return database('challenges')
        .where('challenge_name', challenge)
        .select('id')
        .then(results => results[0])
        .catch();
    });

    Promise.all(userChallengePromises)
      .then(results => {
        const challengesToInsert = results.map(challengeObject => {
          return {
            user_id: userID,
            challenge_id: challengeObject.id
          };
        });

        database('user_challenges').insert(challengesToInsert, '*')
          .then(() => updateInUsersTable())
          .catch(error => response.status(500).json({ error }));
      })
      .catch(error => response.status(500).json({ error }));
  } else {
    updateInUsersTable();
  }


});
// end /users/:userID

// begin /professionals/:professionalID
app.get('/api/v1/professionals/:professionalID', (request, response) => {
  database('professionals')
    .where('professionals.id', request.params.professionalID)
    .leftJoin('professional_specialties', 'professionals.id', '=', 'professional_specialties.professional_id')
    .leftJoin('specialties', 'specialties.id', '=', 'professional_specialties.specialty_id')
    .leftJoin('professional_insurance_providers', 'professionals.id', '=', 'professional_insurance_providers.professional_id')
    .leftJoin('insurance_providers', 'insurance_providers.id', '=', 'professional_insurance_providers.insurance_provider_id')
    .select('professionals.*', 'insurance_providers.insurance_provider_name', 'specialties.specialty_name')
    .then(professionals => {
      if (professionals.length) {

        let completeProfessional = {
          professional_insurance_providers: [],
          professional_specialties: []
        };
        professionals.forEach(professional => {
          if (professional.insurance_provider_name) {

            const providerIndex = completeProfessional.professional_insurance_providers
              .findIndex( provider => professional.insurance_provider_name === provider);

            if (providerIndex === -1) {
              completeProfessional.professional_insurance_providers.push(professional.insurance_provider_name);
            }
          }
          if (professional.specialty_name) {

            const specialtyIndex = completeProfessional.professional_specialties
              .findIndex( specialty => professional.specialty_name === specialty);

            if (specialtyIndex === -1) {
              completeProfessional.professional_specialties.push(professional.specialty_name);
            }
          }
        });
        Object.assign(completeProfessional, {
          id: professionals[0].id,
          professional_name: professionals[0].professional_name,
          professional_image: professionals[0].professional_image,
          professional_location: professionals[0].professional_location,
          professional_email: professionals[0].professional_email,
          professional_phone: professionals[0].professional_phone
        });
        return response.status(200).json({ professional: completeProfessional });
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
  database('favorite_users')
    .where('favorite_users.user_id', request.params.userID)
    .join('users', 'favorite_users.favorite_user_id', '=', 'users.id')
    .select('users.*')
    .then(favoriteUsers => {
      if (favoriteUsers.length > 0) {
        const favUserIDs = favoriteUsers.map(faveUser => faveUser.id);
        getUsersAndChallenges(favUserIDs)
          .then(faveUsers => response.status(200).json({ favoriteUsers: faveUsers }));
      } else {
        return response.status(404).json({ error: `Could not find any favorite users for user id ${request.params.userID}.`});
      }
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
  database('favorite_professionals')
    .where('favorite_professionals.user_id', request.params.userID)
    .join('professionals', 'favorite_professionals.favorite_professional_id', '=', 'professionals.id')
    .select('professionals.*')
    .then(favoriteProfessionals => {
      if (favoriteProfessionals.length > 0) {
        const favProfIds = favoriteProfessionals.map(fave => fave.id);
        getProfessionalInsSpec(favProfIds)
          .then(profs => {
            return response.status(200).json({ favoriteProfessionals: profs });
          });
      } else {
        return response.status(404).json({ error: `Could not find any favorite professionals for user id ${request.params.userID}.`});
      }
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


module.exports = app;
