const challengeData = require('./../../../data/challengeData');
const specialtyData = require('./../../../data/specialtyData');
const professionalData = require('./../../../data/professionalData');
const insuranceData = require('./../../../data/insuranceData');
const profSpecialtyData = require('./../../../data/profSpecialtyData');
const profInsData = require('./../../../data/profInsData');

const createProfessionalSpecialty = (knex, professional, specialty) => {
  let joinRecord = {};
  return knex('specialties').where('specialty_name', specialty).select('id')
    .then(specialtyID => {
      return joinRecord.specialty_id = specialtyID[0].id;
    })
    .then(() => knex('professionals').where('professional_name', professional).select('id'))
    .then(professionalID => joinRecord.professional_id = professionalID[0].id)
    .then(() => knex('professional_specialties').insert(joinRecord));
};

const createProfessionalIns = (knex, professional, insurance) => {
  let joinRecord = {};
  return knex('insurance_providers').where('insurance_provider_name', insurance).select('id')
    .then(insuranceID => joinRecord.insurance_provider_id = insuranceID[0].id)
    .then(() => knex('professionals').where('professional_name', professional).select('id'))
    .then(professionalID => joinRecord.professional_id = professionalID[0].id)
    .then(() => knex('professional_insurance_providers').insert(joinRecord));
};


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
    .then(() => knex('challenges').insert(challengeData))
    .then(() => knex('insurance_providers').insert(insuranceData))
    .then(() => knex('specialties').insert(specialtyData))
    .then(() => knex('professionals').insert(professionalData))
    .then(() => {
      let joinSpecPromises =  profSpecialtyData.map(professional => {
        return createProfessionalSpecialty(knex, professional.professional_name, professional.professional_specialties);
      });
      return Promise.all(joinSpecPromises);
    })
    .then(() => {
      let joinInsPromises =  profInsData.map(professional => {
        return createProfessionalIns(knex, professional.professional_name, professional.professional_insurance_providers);
      });
      return Promise.all(joinInsPromises);
    })
    .then(() => console.log('Seeding complete'))
    .catch(error => console.log(`Error seeding data: ${error}`));
};
