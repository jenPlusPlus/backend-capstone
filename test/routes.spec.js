/* eslint-disable no-unused-expressions */

const chai = require('chai');

// eslint-disable-next-line no-unused-vars
const should = chai.should();

const chaiHttp = require('chai-http');
const server = require('./../server');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);
describe('Client Routes', () => {
  it('should return the homepage', () =>
    chai.request(server)
      .get('/')
      .then((response) => {
        response.should.have.status(200);
        response.should.be.html;
      })
      .catch((err) => { throw err; }));

  it('should return a 404 for a route that does not exist', () =>
    chai.request(server)
      .get('/sad')
      .then((response) => {
        response.should.have.status(404);
      })
      .catch((err) => { throw err; }));
});

describe('API Routes', () => {
  before((done) => {
    database.migrate.latest()
      .then(() => done())
      .catch((error) => { throw error; });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch((error) => { throw error; });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users', () =>
      chai.request(server)
        .get('/api/v1/users')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.users.length.should.equal(3);
          response.body.users.should.be.an('array');
          response.body.users[0].should.have.property('id');
          response.body.users[0].should.have.property('user_name');
          response.body.users[0].should.have.property('user_about');
          response.body.users[0].should.have.property('user_location');
          response.body.users[0].should.have.property('user_email');
          response.body.users[0].should.have.property('user_challenges');
          response.body.users[0].id.should.equal(1);
          response.body.users[0].user_name.should.equal('Jen');
          response.body.users[0].user_about.should.equal('blah');
          response.body.users[0].user_location.should.equal('Denver');
          response.body.users[0].user_email.should.equal('jen@email.com');
        })
        .catch((error) => { throw error; }));

    it('should get users that satisfy a query on user challenges', () =>
      chai.request(server)
        .get('/api/v1/users?user_challenge=Depression')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.users.length.should.equal(1);
          response.body.users.should.be.an('array');
          response.body.users[0].should.have.property('id');
          response.body.users[0].should.have.property('user_name');
          response.body.users[0].should.have.property('user_about');
          response.body.users[0].should.have.property('user_location');
          response.body.users[0].should.have.property('user_email');
          response.body.users[0].should.have.property('user_challenges');
          response.body.users[0].id.should.equal(1);
          response.body.users[0].user_name.should.equal('Jen');
          response.body.users[0].user_about.should.equal('blah');
          response.body.users[0].user_location.should.equal('Denver');
          response.body.users[0].user_email.should.equal('jen@email.com');
          response.body.users[0].user_challenges[0].should.equal('Depression');
        })
        .catch((error) => { throw error; }));


    it('should return a 404 if no users are found', () =>
      chai.request(server)
        .get('/api/v1/users?user_challenge=OCD')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any users associated with 'user_challenge' of 'OCD'`);
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/users', () => {
    it.skip('should be able to add a user to the database', () =>
      chai.request(server)
        .post('/api/v1/users')
        .send({
          id: 9,
          user_name: "Jen",
          user_about: "I'm looking to find new ways to cope with my issues.",
          user_location: "Denver",
          user_email: "jen@email.com",
          user_challenges: ["Depression"]
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "user_name" is not present', () =>
      chai.request(server)
        .post('/api/v1/users')
        .send({
          user_about: "I'm looking to find new ways to cope with my issues.",
          user_location: "Denver",
          user_email: "jen@email.com",
          user_challenges: ["Depression"]
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'user_name' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/professionals', () => {
    it('should get all professionals', () =>
      chai.request(server)
        .get('/api/v1/professionals')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.professionals.length.should.equal(3);
          response.body.professionals.should.be.an('array');
          response.body.professionals[0].should.have.property('id');
          response.body.professionals[0].should.have.property('professional_name');
          response.body.professionals[0].should.have.property('professional_location');
          response.body.professionals[0].should.have.property('professional_email');
          response.body.professionals[0].should.have.property('professional_phone');
          response.body.professionals[0].should.have.property('professional_insurance_providers');
          response.body.professionals[0].should.have.property('professional_specialties');
          response.body.professionals[0].id.should.equal(1);
          response.body.professionals[0].professional_name.should.equal('Dr. Psych');
          response.body.professionals[0].professional_location.should.equal('Denver');
          response.body.professionals[0].professional_email.should.equal('psych@email.com');
          response.body.professionals[0].professional_phone.should.equal('555-555-5555');
          response.body.professionals[0].professional_insurance_providers[0].should.equal('BCBS');
          response.body.professionals[0].professional_specialties[0].should.equal('Couples');
        })
        .catch((error) => { throw error; }));

    it('should get professionals that satisfy a query on professional specialties', () =>
      chai.request(server)
        .get('/api/v1/professionals?specialty=Couples')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.professionals.length.should.equal(1);
          response.body.professionals.should.be.an('array');
          response.body.professionals[0].should.have.property('id');
          response.body.professionals[0].should.have.property('professional_name');
          response.body.professionals[0].should.have.property('professional_location');
          response.body.professionals[0].should.have.property('professional_email');
          response.body.professionals[0].should.have.property('professional_phone');
          response.body.professionals[0].should.have.property('professional_insurance_providers');
          response.body.professionals[0].should.have.property('professional_specialties');
          response.body.professionals[0].id.should.equal(1);
          response.body.professionals[0].professional_name.should.equal('Dr. Psych');
          response.body.professionals[0].professional_location.should.equal('Denver');
          response.body.professionals[0].professional_email.should.equal('psych@email.com');
          response.body.professionals[0].professional_phone.should.equal('555-555-5555');
          response.body.professionals[0].professional_insurance_providers[0].should.equal('BCBS');
          response.body.professionals[0].professional_specialties[0].should.equal('Couples');
        })
        .catch((error) => { throw error; }));

    it('should get professionals that satisfy a query on professional insurance providers', () =>
      chai.request(server)
        .get('/api/v1/professionals?insurance_provider=BCBS')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.professionals.length.should.equal(1);
          response.body.professionals.should.be.an('array');
          response.body.professionals[0].should.have.property('id');
          response.body.professionals[0].should.have.property('professional_name');
          response.body.professionals[0].should.have.property('professional_location');
          response.body.professionals[0].should.have.property('professional_email');
          response.body.professionals[0].should.have.property('professional_phone');
          response.body.professionals[0].should.have.property('professional_insurance_providers');
          response.body.professionals[0].should.have.property('professional_specialties');
          response.body.professionals[0].id.should.equal(1);
          response.body.professionals[0].professional_name.should.equal('Dr. Psych');
          response.body.professionals[0].professional_location.should.equal('Denver');
          response.body.professionals[0].professional_email.should.equal('psych@email.com');
          response.body.professionals[0].professional_phone.should.equal('555-555-5555');
          response.body.professionals[0].professional_insurance_providers[0].should.equal('BCBS');
          response.body.professionals[0].professional_specialties[0].should.equal('Couples');
        })
        .catch((error) => { throw error; }));


    it('should return a 404 if no professionals are found', () =>
      chai.request(server)
        .get('/api/v1/professionals?specialty=Non-religious')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any professionals associated with 'specialty' of 'Non-religious'`);
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/professionals', () => {
    it.skip('should be able to add a professional to the database', () =>
      chai.request(server)
        .post('/api/v1/professionals')
        .send({
          id: 50,
          professional_name: "Dr. Watson",
          professional_location: "Denver",
          professional_email: "watson@email.com",
          professional_phone: "123-456-7890",
          professional_insurance_providers: ["BCBS"],
          professional_specialties: ["Couples"]
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "professional_name" is not present', () =>
      chai.request(server)
        .post('/api/v1/professionals')
        .send({
          professional_location: "Denver",
          professional_email: "watson@email.com",
          professional_phone: "123-456-7890",
          professional_insurance_providers: ["BCBS"]
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'professional_name' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/insuranceProviders', () => {
    it('should get all insurance providers', () =>
      chai.request(server)
        .get('/api/v1/insuranceProviders')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.insuranceProviders.length.should.equal(3);
          response.body.insuranceProviders.should.be.an('array');
          response.body.insuranceProviders[0].should.have.property('id');
          response.body.insuranceProviders[0].should.have.property('insurance_provider_name');
          response.body.insuranceProviders[0].id.should.equal(1);
          response.body.insuranceProviders[0].insurance_provider_name.should.equal('BCBS');
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/insuranceProviders', () => {
    it.skip('should be able to add an insurance provider to the database', () =>
      chai.request(server)
        .post('/api/v1/insuranceProviders')
        .send({
          id: 50,
          insurance_provider_name: "Humana"
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "insurance_provider_name" is not present', () =>
      chai.request(server)
        .post('/api/v1/insuranceProviders')
        .send({
          id: 70
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'insurance_provider_name' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/specialties', () => {
    it('should get all specialties', () =>
      chai.request(server)
        .get('/api/v1/specialties')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.specialties.length.should.equal(3);
          response.body.specialties.should.be.an('array');
          response.body.specialties[0].should.have.property('id');
          response.body.specialties[0].should.have.property('specialty_name');
          response.body.specialties[0].id.should.equal(1);
          response.body.specialties[0].specialty_name.should.equal('Couples');
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/specialties', () => {
    it.skip('should be able to add a specialty to the database', () =>
      chai.request(server)
        .post('/api/v1/specialties')
        .send({
          id: 50,
          specialty_name: "Trauma"
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "specialty_name" is not present', () =>
      chai.request(server)
        .post('/api/v1/specialties')
        .send({
          id: 70
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'specialty_name' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/challenges', () => {
    it('should get all challenges', () =>
      chai.request(server)
        .get('/api/v1/challenges')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.challenges.length.should.equal(3);
          response.body.challenges.should.be.an('array');
          response.body.challenges[0].should.have.property('id');
          response.body.challenges[0].should.have.property('challenge_name');
          response.body.challenges[0].id.should.equal(1);
          response.body.challenges[0].challenge_name.should.equal('Depression');
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/challenges', () => {
    it.skip('should be able to add a challenge to the database', () =>
      chai.request(server)
        .post('/api/v1/challenges')
        .send({
          id: 50,
          challenge_name: "ADHD"
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "challenge_name" is not present', () =>
      chai.request(server)
        .post('/api/v1/challenges')
        .send({
          id: 70
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'challenge_name' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/users/:userID', () => {
    it('should get a specific user by ID', () =>
      chai.request(server)
        .get('/api/v1/users/3')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.users.length.should.equal(1);
          response.body.users.should.be.an('array');
          response.body.users[0].should.have.property('id');
          response.body.users[0].should.have.property('user_name');
          response.body.users[0].should.have.property('user_about');
          response.body.users[0].should.have.property('user_location');
          response.body.users[0].should.have.property('user_email');
          response.body.users[0].should.have.property('user_challenges');
          response.body.users[0].id.should.equal(3);
          response.body.users[0].user_name.should.equal('Cameron');
          response.body.users[0].user_about.should.equal('blah blah blah');
          response.body.users[0].user_location.should.equal('Denver');
          response.body.users[0].user_email.should.equal('cam@email.com');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no users are found', () =>
      chai.request(server)
        .get('/api/v1/users/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any user associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('DELETE /api/v1/users/:userID', () => {
    it.skip('should delete a specific user by id', () =>
      chai.request(server)
        .del('/api/v1/users/3')
        .then((response) => {
          response.should.have.status(204);
          response.body.id.should.equal(3);
        })
        .catch((error) => { throw error; }));

    it.skip('should return a 404 if no users are found', () =>
      chai.request(server)
        .del('/api/v1/users/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any user associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('PATCH /api/v1/users/:userID', () => {
    it('should be able to update a user record', () => {
      chai.request(server)
        .patch('/api/v1/users/3')
        .send({
          user_name: "Jen",
          user_about: "I'm looking to find new ways to cope with my issues.",
          user_location: "Denver",
          user_email: "jen@email.com",
          user_challenges: ["Depression"]
        })
        .then((response) => {
          response.should.have.status(202);
          response.should.be.json;
          response.body.player.should.be.an('object');
          response.body.users.length.should.equal(1);
          response.body.users.should.be.an('array');
          response.body.users[0].should.have.property('id');
          response.body.users[0].should.have.property('user_name');
          response.body.users[0].should.have.property('user_about');
          response.body.users[0].should.have.property('user_location');
          response.body.users[0].should.have.property('user_email');
          response.body.users[0].should.have.property('user_challenges');
          response.body.users[0].id.should.equal(3);
          response.body.users[0].user_name.should.equal('Jen');
          response.body.users[0].user_about.should.equal(`I'm looking to find new ways to cope with my issues.`);
          response.body.users[0].user_location.should.equal('Denver');
          response.body.users[0].user_email.should.equal('jen@email.com');
          response.body.users[0].user_challenges[0].should.equal('Depression');
        })
        .catch((error) => { throw error; });
    });
  });

  describe('GET /api/v1/professionals/:professionalID', () => {
    it('should get a specific professional by ID', () =>
      chai.request(server)
        .get('/api/v1/professionals/3')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.professional.should.be.an('object');
          response.body.professional.should.have.property('id');
          response.body.professional.should.have.property('professional_name');
          response.body.professional.should.have.property('professional_location');
          response.body.professional.should.have.property('professional_email');
          response.body.professional.should.have.property('professional_phone');
          response.body.professional.should.have.property('professional_insurance_providers');
          response.body.professional.should.have.property('professional_specialties');
          response.body.professional.id.should.equal(3);
          response.body.professional.professional_name.should.equal('Dr. Mind');
          response.body.professional.professional_location.should.equal('Denver');
          response.body.professional.professional_email.should.equal('mind@email.com');
          response.body.professional.professional_phone.should.equal('555-555-1111');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no professionals are found', () =>
      chai.request(server)
        .get('/api/v1/professional/99999999')
        .then((response) => {
          response.should.have.status(404);
        })
        .catch((error) => { throw error; }));
  });

  describe('DELETE /api/v1/professionals/:professionalID', () => {
    it.skip('should delete a specific professional by id', () =>
      chai.request(server)
        .del('/api/v1/professionals/3')
        .then((response) => {
          response.should.have.status(204);
          response.body.id.should.equal(3);
        })
        .catch((error) => { throw error; }));

    it.skip('should return a 404 if no professionals are found', () =>
      chai.request(server)
        .del('/api/v1/professionals/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any professional associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/insuranceProviders/:insuranceProviderID', () => {
    it('should get a specific insurance provider by ID', () =>
      chai.request(server)
        .get('/api/v1/insuranceProviders/1')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.insuranceProvider.should.have.property('id');
          response.body.insuranceProvider.should.have.property('insurance_provider_name');
          response.body.insuranceProvider.id.should.equal(1);
          response.body.insuranceProvider.insurance_provider_name.should.equal('BCBS');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no insurance providers are found', () =>
      chai.request(server)
        .get('/api/v1/insuranceProviders/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any insurance provider associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/specialties/:specialtyID', () => {
    it('should get a specific specialty by ID', () =>
      chai.request(server)
        .get('/api/v1/specialties/1')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.specialty.should.have.property('id');
          response.body.specialty.should.have.property('specialty_name');
          response.body.specialty.id.should.equal(1);
          response.body.specialty.specialty_name.should.equal('Couples');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no specialties are found', () =>
      chai.request(server)
        .get('/api/v1/specialties/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any specialty associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/challenges/:challengeID', () => {
    it('should get a specific challenge by ID', () =>
      chai.request(server)
        .get('/api/v1/challenges/1')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.challenge.should.have.property('id');
          response.body.challenge.should.have.property('challenge_name');
          response.body.challenge.id.should.equal(1);
          response.body.challenge.challenge_name.should.equal('Depression');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no specialties are found', () =>
      chai.request(server)
        .get('/api/v1/challenges/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any challenge associated with id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/favoriteUsers/:userID', () => {
    it('should get all favorite users by a user ID', () =>
      chai.request(server)
        .get('/api/v1/favoriteUsers/2')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.favoriteUsers.should.be.an('array');
          response.body.favoriteUsers[0].should.have.property('id');
          response.body.favoriteUsers[0].should.have.property('user_name');
          response.body.favoriteUsers[0].should.have.property('user_about');
          response.body.favoriteUsers[0].should.have.property('user_location');
          response.body.favoriteUsers[0].should.have.property('user_email');
          response.body.favoriteUsers[0].should.have.property('user_challenges');
          response.body.favoriteUsers[0].id.should.equal(3);
          response.body.favoriteUsers[0].user_name.should.equal('Cameron');
          response.body.favoriteUsers[0].user_about.should.equal('blah blah blah');
          response.body.favoriteUsers[0].user_location.should.equal('Denver');
          response.body.favoriteUsers[0].user_email.should.equal('cam@email.com');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no favorite users are found', () =>
      chai.request(server)
        .get('/api/v1/favoriteUsers/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any favorite users for user id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('GET /api/v1/favoriteProfessionals/:userID', () => {
    it('should get all favorite professionals by a user ID', () =>
      chai.request(server)
        .get('/api/v1/favoriteProfessionals/2')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.favoriteProfessionals.should.be.an('array');
          response.body.favoriteProfessionals[0].should.have.property('id');
          response.body.favoriteProfessionals[0].should.have.property('professional_name');
          response.body.favoriteProfessionals[0].should.have.property('professional_location');
          response.body.favoriteProfessionals[0].should.have.property('professional_email');
          response.body.favoriteProfessionals[0].should.have.property('professional_phone');
          response.body.favoriteProfessionals[0].should.have.property('professional_insurance_providers');
          response.body.favoriteProfessionals[0].should.have.property('professional_specialties');
          response.body.favoriteProfessionals[0].id.should.equal(3);
          response.body.favoriteProfessionals[0].professional_name.should.equal('Dr. Mind');
          response.body.favoriteProfessionals[0].professional_location.should.equal('Denver');
          response.body.favoriteProfessionals[0].professional_email.should.equal('mind@email.com');
          response.body.favoriteProfessionals[0].professional_phone.should.equal('555-555-1111');
        })
        .catch((error) => { throw error; }));

    it('should return a 404 if no favorite professionals are found', () =>
      chai.request(server)
        .get('/api/v1/favoriteProfessionals/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find any favorite professionals for user id 99999999.`);
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/favoriteUsers/:userID', () => {
    it('should be able to add a favorite user to the database', () =>
      chai.request(server)
        .post('/api/v1/favoriteUsers/3')
        .send({
          favoriteUserID: 1
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.an('object');
          response.body.favoriteUser.should.be.an('array');
          response.body.favoriteUser[0].should.have.property('user_id');
          response.body.favoriteUser[0].should.have.property('favorite_user_id');
          response.body.favoriteUser[0].user_id.should.equal(3);
          response.body.favoriteUser[0].favorite_user_id.should.equal(1);

        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "favoriteUserID" is not present', () =>
      chai.request(server)
        .post('/api/v1/favoriteUsers/3')
        .send({
          favoriteUserID: ''
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'favoriteUserID' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('POST /api/v1/favoriteProfessionals/:userID', () => {
    it('should be able to add a favorite professional to the database', () =>
      chai.request(server)
        .post('/api/v1/favoriteProfessionals/3')
        .send({
          favoriteProfessionalID: 1
        })
        .then((response) => {
          response.should.have.status(201);
          response.body.should.be.an('object');
          response.body.favoriteProfessional.should.be.an('array');
          response.body.favoriteProfessional[0].should.have.property('user_id');
          response.body.favoriteProfessional[0].should.have.property('favorite_professional_id');
          response.body.favoriteProfessional[0].user_id.should.equal(3);
          response.body.favoriteProfessional[0].favorite_professional_id.should.equal(1);

        })
        .catch((error) => { throw error; }));

    it('should return a 422 if "favoriteProfessionalID" is not present', () =>
      chai.request(server)
        .post('/api/v1/favoriteProfessionals/3')
        .send({
          favoriteUserID: ''
        })
        .then((response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal("You are missing the 'favoriteProfessionalID' property");
        })
        .catch((error) => { throw error; }));
  });

  describe('DELETE /api/v1/favoriteUsers/:userID/:favoriteUserID', () => {
    it('should delete a favorite user by id', () =>
      chai.request(server)
        .del('/api/v1/favoriteUsers/2/3')
        .then((response) => {
          response.should.have.status(204);
        })
        .catch((error) => { throw error; }));

    it.skip('should return a 404 if no users are found', () =>
      chai.request(server)
        .del('/api/v1/favoriteUsers/25/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find favorite user with id '99999999' for user id 2`);
        })
        .catch((error) => { throw error; }));
  });

  describe('DELETE /api/v1/favoriteProfessionals/:userID/:favoriteProfessionalID', () => {
    it('should delete a favorite professional by id', () =>
      chai.request(server)
        .del('/api/v1/favoriteProfessionals/2/3')
        .then((response) => {
          response.should.have.status(204);
        })
        .catch((error) => { throw error; }));

    it.skip('should return a 404 if no users are found', () =>
      chai.request(server)
        .del('/api/v1/favoriteProfessionals/25/99999999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal(`Could not find favorite user with id '99999999' for user id 2`);
        })
        .catch((error) => { throw error; }));
  });
});
