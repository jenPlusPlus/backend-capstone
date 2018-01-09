/* eslint-disable */

const userData = [{
  id: 1,
  user_name: 'Jen',
  user_about: 'blah',
  user_location: 'Denver',
  user_email: 'jen@email.com'
},
{
  id: 2,
  user_name: 'Lola',
  user_about: 'blah blah',
  user_location: 'Denver',
  user_email: 'lola@email.com'
},
{
  id: 3,
  user_name: 'Cameron',
  user_about: 'blah blah blah',
  user_location: 'Denver',
  user_email: 'cam@email.com'
}
];

const profData = [{
  id: 1,
  professional_name: 'Dr. Psych',
  professional_location: 'Denver',
  professional_email: 'psych@email.com',
  professional_phone: '555-555-5555'
},
{
  id: 2,
  professional_name: 'Dr. Healthy',
  professional_location: 'Denver',
  professional_email: 'health@email.com',
  professional_phone: '555-555-1234'
},
{
  id: 3,
  professional_name: 'Dr. Mind',
  professional_location: 'Denver',
  professional_email: 'mind@email.com',
  professional_phone: '555-555-1111'
}];

const challengeData = [{
  id: 1,
  challenge_name: 'Depression'
},
{ id: 2,
  challenge_name: 'Anxiety'
},
{
  id: 3,
  challenge_name: 'OCD'
}];

const insuranceData = [{
  id: 1,
  insurance_provider_name: 'BCBS'
},
{
  id: 2,
  insurance_provider_name: 'Aetna'
},
{
  id: 3,
  insurance_provider_name: 'Cigna'
}];

const specialtyData = [{
  id: 1,
  specialty_name: 'Couples'
},
{ id: 2,
  specialty_name: 'LGBTQ'
},
{ id: 3,
  specialty_name: 'Non-religious'
}];


exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user_challenges').del()
    .then(() => knex('professional_insurance_providers').del())
    .then(() => knex('professional_specialties').del())
    .then(() => knex('favorite_professionals').del())
    .then(() => knex('favorite_users').del())
    .then(() => knex('specialties').del())
    .then(() => knex('insurance_providers').del())
    .then(() => knex('challenges').del())
    .then(() => knex('professionals').del())
    .then(() => knex('users').del())
    .then(() => {
      return knex('users').insert(userData);
    })
    .then(() => {
      return knex('professionals').insert(profData);
    })
    .then(() => {
      return knex('challenges').insert(challengeData);
    })
    .then(() => {
      return knex('insurance_providers').insert(insuranceData);
    })
    .then(() => {
      return knex('specialties').insert(specialtyData);
    })
    .then(() => {
      return knex('favorite_users').insert([{
        user_id: 1,
        favorite_user_id: 2
      },
      {
        user_id: 1,
        favorite_user_id: 3
      },
      {
        user_id: 2,
        favorite_user_id: 3
      }]);
    })
    .then(() => {
      return knex('favorite_professionals').insert([{
        user_id: 1,
        favorite_professional_id: 1
      },
      {
        user_id: 1,
        favorite_professional_id: 3
      },
      {
        user_id: 2,
        favorite_professional_id: 3
      }]);
    })
    .then(() => {
      return knex('professional_specialties').insert([{
        professional_id: 1,
        specialty_id: 1
      },
      {
        professional_id: 2,
        specialty_id: 2
      },
      {
        professional_id: 3,
        specialty_id: 2
      }]);
    })
    .then(() => {
      return knex('professional_insurance_providers').insert([{
        professional_id: 1,
        insurance_provider_id: 1
      },
      {
        professional_id: 2,
        insurance_provider_id: 2
      },
      {
        professional_id: 3,
        insurance_provider_id: 2
      }]);
    })
    .then(() => {
      return knex('user_challenges').insert([{
        user_id: 1,
        challenge_id: 1
      },
      {
        user_id: 2,
        challenge_id: 2
      },
      {
        user_id: 3,
        challenge_id: 2
      }]);
    })
    .then(() => console.log('Seeding complete'))
    .catch(error => console.log(`Error seeding data: ${error}`));
};
