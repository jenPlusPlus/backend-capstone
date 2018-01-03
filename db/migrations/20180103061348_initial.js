
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('user_name');
      table.string('user_image');
      table.string('user_about');
      table.string('user_location');
      table.string('user_email');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('professionals', (table) => {
      table.increments('id').primary();
      table.string('professional_name');
      table.string('professional_image');
      table.string('professional_location');
      table.string('professional_email');
      table.string('professional_phone');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('challenges', (table) => {
      table.increments('id').primary();
      table.string('challenge_name');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('insurance_providers', (table) => {
      table.increments('id').primary();
      table.string('insurance_provider_name');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('specialties', (table) => {
      table.increments('id').primary();
      table.string('specialty_name');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('favorite_users', (table) => {
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.integer('favorite_user_id').unsigned();
      table.foreign('favorite_user_id').references('users.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('favorite_professionals', (table) => {
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.integer('favorite_professional_id').unsigned();
      table.foreign('favorite_professional_id').references('professionals.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('professional_specialties', (table) => {
      table.integer('professional_id').unsigned();
      table.foreign('professional_id').references('professionals.id');
      table.integer('specialty_id').unsigned();
      table.foreign('specialty_id').references('specialties.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('professional_insurance_providers', (table) => {
      table.integer('professional_id').unsigned();
      table.foreign('professional_id').references('professionals.id');
      table.integer('insurance_provider_id').unsigned();
      table.foreign('insurance_provider_id').references('insurance_providers.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('user_challenges', (table) => {
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.integer('challenge_id').unsigned();
      table.foreign('challenge_id').references('challenges.id');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('user_challenges'),
    knex.schema.dropTable('professional_insurance_providers'),
    knex.schema.dropTable('professional_specialties'),
    knex.schema.dropTable('favorite_professionals'),
    knex.schema.dropTable('favorite_users'),
    knex.schema.dropTable('specialties'),
    knex.schema.dropTable('insurance_providers'),
    knex.schema.dropTable('challenges'),
    knex.schema.dropTable('professionals'),
    knex.schema.dropTable('users')
  ]);
};
