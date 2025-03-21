import knex from 'knex';  // Import knex
import knexConfig from './knexfile.js';  // Import your knexfile

// Initialize knex with the configuration
const db = knex(knexConfig);

export default db; 