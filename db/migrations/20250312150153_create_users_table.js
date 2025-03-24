/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()')); // Fix for UUID default
    table.string('identifier').unique().notNullable(); // Username or Email
    table.string('password').notNullable();
    table.timestamps(true, true);
  });
}

/**
* @param { import("knex").Knex } knex
* @returns { Promise<void> }
*/
export function down(knex) {
  return knex.schema.dropTable('users');
}
