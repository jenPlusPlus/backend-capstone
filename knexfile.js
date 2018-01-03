module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/mental_health_app',
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true
  }
};
