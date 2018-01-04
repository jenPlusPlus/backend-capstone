module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/mental_health_app',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true
  }
};
