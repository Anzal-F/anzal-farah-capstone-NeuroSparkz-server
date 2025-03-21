import knex from '../db.js';

export const saveFlashcard = async (userId, flashcards) => {
  try {
    const flashcardData = flashcards.map((flashcard) => ({
      user_id: userId,
      key_point: flashcard.keyPoint,
      description: flashcard.description,
      example: flashcard.example || null, 
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
      const regeneratedFlashcards = flashcards.map((flashcard) => ({
        user_id: userId,
        key_point: flashcard.keyPoint,
        description: flashcard.description,
        example: flashcard.example || null,
      }));
      
      await knex('flashcards').insert(regeneratedFlashcards);
      return { message: 'Flashcards regenerated successfully' };
    } catch (error) {
      console.error('Error regenerating flashcards:', error);
      throw new Error('Failed to regenerate flashcards');
    }
  };
  