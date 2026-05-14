/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('password_reset_attempts', {
    id: {
      type: 'bigserial',
      notNull: true,
      primaryKey: true,
    },
    email: { type: 'varchar(100)', notNull: true },
    attempt_date: {
      type: 'date',
      notNull: true,
      default: pgm.func('CURRENT_DATE'),
    },
    attempt_count: { type: 'int', notNull: true, default: 0 },
  });

  pgm.addConstraint(
    'password_reset_attempts',
    'password_reset_attempts_email_date_unique',
    { unique: ['email', 'attempt_date'] },
  );

  pgm.createIndex('password_reset_attempts', 'attempt_date');
};

exports.down = (pgm) => {
  pgm.dropTable('password_reset_attempts', { ifExists: true });
};
