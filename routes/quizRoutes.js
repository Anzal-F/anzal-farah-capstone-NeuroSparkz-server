
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to generate quiz questions
const generateQuiz = async (text) => {
  if (!text || text.trim() === "") {
    return { error: 'Please provide some content to generate a quiz.' };
  }

  if (text.split(' ').length < 20) {
    return { error: 'The provided text is too short. Please add more content for a better quiz.' };
  }

  const prompt = `
    Generate a quiz with up to 10 questions based on this text.
    Each question should have:
    - "question": A clear question
    - "options": Four choices (one correct)
    - "correctAnswer": The right answer
    
    Text:
    ${text}

    Example response:
    [
      {
        "question": "What is the main function of the sun?",
        "options": ["Provides heat", "Reflects light", "Produces oxygen", "Absorbs energy"],
        "correctAnswer": "Provides heat"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();
    const cleanResponse = rawResponse.replace(/```json|```/g, '').trim();
    
    let quizQuestions = JSON.parse(cleanResponse);

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      return { error: 'No questions were generated. Please provide more detailed content.' };
    }

    return { questions: quizQuestions };
  } catch (error) {
    console.error('Error generating quiz:', error);
    return { error: 'Failed to generate quiz. Try again later.' };
  }
};

// POST endpoint to generate a quiz
router.post('/generate-quiz', async (req, res) => {
  const { text } = req.body;

  const quizData = await generateQuiz(text);
  if (quizData.error) {
    return res.status(400).json({ error: quizData.error });
  }

  res.json(quizData);
});

export default router;