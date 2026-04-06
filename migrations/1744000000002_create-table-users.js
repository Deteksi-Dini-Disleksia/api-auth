/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS "users" CASCADE;');

  pgm.createTable('users', {
    user_id: {
      type: 'bigserial',
      notNull: true,
      primaryKey: true,
    },
    username: { type: 'varchar(100)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    fullname: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(10)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('users', 'users_role_check', {
    check: "(role IN ('ADMIN','GURU'))",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users', { ifExists: true });
};
