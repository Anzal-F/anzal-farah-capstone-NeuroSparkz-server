// flashcardService.js
import db from '../db.js';  

/**
 * Fetch flashcards for a specific user.
 * 
 * @param {string} userId - The ID of the user to fetch flashcards for.
 * @returns {Array} - An array of flashcards associated with the user.
 */
export const getUserFlashcards = async (userId) => {
  try {
    const flashcards = await db('flashcards').where({ user_id: userId });

    return flashcards;
  } catch (error) {
    throw new Error('Error retrieving flashcards: ' + error.message);  
  }
};