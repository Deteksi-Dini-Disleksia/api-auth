/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('password_reset_tokens', {
    id: {
      type: 'bigserial',
      notNull: true,
      primaryKey: true,
    },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    token: { type: 'varchar(64)', notNull: true, unique: true },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('password_reset_tokens', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('password_reset_tokens', { ifExists: true });
};
