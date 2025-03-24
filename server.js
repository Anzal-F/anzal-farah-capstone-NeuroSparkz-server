import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import quizRoutes from "./routes/quizRoutes.js";
import flashcardRouter from "./routes/flashcardRoute.js";
import signupRouter from "./routes/auth/signup.js"
import loginRouter from "./routes/auth/Login.js"
import userRoutes from "./routes/userRoutes.js"

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 


app.use('/api', quizRoutes); 
app.use('/api/flashcards', flashcardRouter);
app.use('/api', signupRouter);
app.use('/api', loginRouter);
app.use('/api/user', userRoutes);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
