import knex from '../db.js';

export const saveFlashcard = async (userId, flashcards) => {
  try {
    const flashcardData = flashcards.map((flashcard) => ({
      user_id: userId,
      key_point: flashcard.keyPoint,
      description: flashcard.description,
      example: flashcard.example || null, // Optional example
    }));

    await knex('flashcards').insert(flashcardData);
    return { message: 'Flashcards saved successfully' };
  } catch (error) {
    console.error('Error saving flashcards:', error);
    throw new Error('Failed to save flashcards');
  }
};

export const getUserFlashcards = async (userId) => {
  try {
    return await knex('flashcards').where({ user_id: userId }).orderBy('created_at', 'desc');
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    throw new Error('Failed to retrieve flashcards');
  }
};
// In flashcardModel.js

export const regenerateFlashcards = async (userId, flashcards) => {
    try {
      // Your logic to regenerate flashcards (e.g., update existing ones or generate new ones)
      const regeneratedFlashcards = flashcards.map((flashcard) => ({
        user_id: userId,
        key_point: flashcard.keyPoint,
        description: flashcard.description,
        example: flashcard.example || null,
      }));
  
      // Update or insert into database
      await knex('flashcards').insert(regeneratedFlashcards);
      return { message: 'Flashcards regenerated successfully' };
    } catch (error) {
      console.error('Error regenerating flashcards:', error);
      throw new Error('Failed to regenerate flashcards');
    }
  };
  