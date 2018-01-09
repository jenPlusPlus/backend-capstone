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
          response.body.users.length.should.equal(2);
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
});
