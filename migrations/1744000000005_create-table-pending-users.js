/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('pending_users', {
    id: {
      type: 'bigserial',
      notNull: true,
      primaryKey: true,
    },
    username: { type: 'varchar(100)', notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    fullname: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(10)', notNull: true },
    verification_token: { type: 'varchar(64)', notNull: true, unique: true },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint('pending_users', 'pending_users_role_check', {
    check: "(role IN ('ADMIN','GURU'))",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('pending_users', { ifExists: true });
};
