/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
    return knex.schema.createTable('flashcards', (table) => {  // Use 'flashcards' here
      table.uuid('id').defaultTo(knex.raw('(UUID())')).primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('topic', 255).notNullable();
      table.json('cards').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  

  /**
* @param { import("knex").Knex } knex
* @returns { Promise<void> }
*/
  export function down(knex) {
    return knex.schema.dropTable('flashcards');  // Drop 'flashcards' here as well
  }
  