
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import authenticateToken from './userRoutes.js';
import db from '../db.js';
import { getUserFlashcards } from "./flashcarddb.js";

dotenv.config();

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// generate flashcards using Gemini API
const generateFlashcards = async (text) => {
  const prompt = `
    Extract detailed key points from the following text and format them as a JSON array of 20 flashcards.
    Each flashcard should include:
    - "keyPoint": A concise, clear main idea.
    - "description": A well-explained, easy-to-understand explanation.
    - "example": A simple example, if applicable.

    Text:
    ${text}

    Example response:
    [
      { 
        "keyPoint": "Photosynthesis converts sunlight into energy.", 
        "description": "Plants use sunlight to convert carbon dioxide and water into glucose and oxygen, providing energy for growth.",
        "example": "A sunflower turning towards the sun to absorb light for photosynthesis."
      },
      { 
        "keyPoint": "Newton's First Law states an object stays in motion unless stopped.", 
        "description": "An object remains in its state of motion or rest unless acted upon by an external force.",
        "example": "A rolling soccer ball slows down due to friction."
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const rawResponse = result.response.text();
  const cleanResponse = rawResponse.replace(/```json|```/g, '').trim();

  return JSON.parse(cleanResponse);
};

// Use the middleware conditionally
router.post('/generate-flashcards', async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the header

  // If there is a token, apply the authMiddleware
  if (token) {
    return authMiddleware(req, res, next); // Pass control to the authMiddleware
  } else {
    // If no token is present, allow the request to proceed without authMiddleware
    return next();
  }
}, async (req, res) => {
  const { text, topic } = req.body;

  // Validate the input text
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required' });
  }

  // If the user is logged in, the topic must be provided
  if (req.user && (!topic || topic.trim() === '')) {
    return res.status(400).json({ error: 'Topic is required for logged-in users' });
  }

  try {
    const flashcards = await generateFlashcards(text); // Get flashcards from Gemini API

    if (!flashcards || flashcards.length === 0) {
      return res.status(500).json({ error: 'Failed to generate flashcards' });
    }

    let savedFlashcards = null;

    // If the user is logged in, save flashcards to the database
    if (req.user) {
      console.log('🔐 User is logged in. Saving flashcards...');
      
      const userId = req.user.id;
      const user = await db('users').where({ id: userId }).first(); 

      if (!user) {
        console.log('❌ User not found!');
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('💾 Saving flashcards to the database...');
      await db('flashcards').insert({
        user_id: user.id,
        topic, // Store topic if logged in
        cards: JSON.stringify(flashcards),
        created_at: db.fn.now(),
      });

      // Get the most recent saved flashcards
      savedFlashcards = await db('flashcards')
        .where({ user_id: user.id })
        .orderBy('created_at', 'desc')
        .first();

      console.log('🔄 Saved Flashcards:', savedFlashcards);
    }

    // Return the flashcards and whether they were saved
    res.json({ flashcards, saved: !!savedFlashcards });

  } catch (error) {
    console.error('❌ Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards', details: error.message });
  }
});





// GET user's flashcards
router.get('/user-flashcards/:userId', authMiddleware, async (req, res) => {
  try {
    let { userId } = req.params;

    if (userId.startsWith(":")) {
      userId = userId.slice(1);
    }

    if (!userId || !req.user || String(req.user.id) !== String(userId)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid user ID' });
    }

    const flashcards = await getUserFlashcards(userId);
    res.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Failed to retrieve flashcards', details: error.message });
  }
});

// DELETE a flashcard
router.delete('/delete-flashcard/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const identifier = req.user?.identifier;

    if (!identifier) {
      console.error("User is not authenticated");
      return res.status(401).json({ error: "User is not authenticated" });
    }

    // Find the flashcard in the database using the provided ID
    const flashcard = await db('flashcards')
      .where({ id })
      .andWhere({ user_id: req.user.id })
      .first();

    if (!flashcard) {
      console.error("Flashcard not found");
      return res.status(404).json({ error: "Flashcard not found" });
    }

    // Delete the flashcard
    await db('flashcards').where({ id }).del();

    console.log("Flashcard deleted successfully");
    res.status(200).json({ message: "Flashcard deleted successfully" });
  } catch (error) {
    console.error("Error deleting flashcard: ", error.message);
    res.status(500).json({ error: "Failed to delete flashcard", details: error.message });
  }
});

export default router;