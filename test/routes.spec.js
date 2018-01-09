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
        })
        .catch((error) => { throw error; }));
  });
});
