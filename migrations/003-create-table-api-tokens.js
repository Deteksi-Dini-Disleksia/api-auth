/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS "api_tokens" CASCADE;');

  pgm.createTable('api_tokens', {
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    token: { type: 'varchar(255)', notNull: true },
    device_type: { type: 'varchar(10)', notNull: true },
    expired_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('api_tokens', 'api_tokens_device_type_check', {
    check: "(device_type IN ('MOBILE','WEB'))",
  });

  pgm.addConstraint('api_tokens', 'api_tokens_unique_user_device', {
    unique: ['user_id', 'device_type'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('api_tokens', { ifExists: true });
};
