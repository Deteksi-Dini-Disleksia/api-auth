/* eslint-disable no-param-reassign */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn('api_tokens', 'token', { type: 'text' });
};

exports.down = (pgm) => {
  pgm.alterColumn('api_tokens', 'token', { type: 'varchar(255)' });
};
