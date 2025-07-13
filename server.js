require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Fuse = require('fuse.js'); // Import Fuse.js

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS for production readiness
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173']; // Add common local frontend ports

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Allow requests with no origin (e.g., cURL) or from allowed origins
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

let faqs = [];
try {
    const faqData = fs.readFileSync('./data/faqs.json', 'utf8');
    faqs = JSON.parse(faqData);
    console.log('✅ FAQ data loaded successfully.');
} catch (err) {
    console.error('❌ Error reading or parsing FAQ data:', err);
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    throw new Error('❌ GEMINI_API_KEY is not defined in the .env file');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Initialize Fuse.js for fuzzy searching
const fuseOptions = {
    includeScore: true, // We need the score to filter relevance
    keys: [
        { name: 'question', weight: 0.7 }, // Prioritize matching in the question
        { name: 'keywords', weight: 0.3 }  // Less priority for keywords
    ],
    threshold: 0.4, // Adjust this: 0.0 is exact, 1.0 is very loose. Lower means stricter.
    ignoreLocation: true, // Don't care about the position of the match
    findAllMatches: true // Find all matches for a given pattern
};
const fuse = new Fuse(faqs, fuseOptions);

app.post('/api/chat', async (req, res) => {
    try {
        const userQuestion = req.body.question;
        if (!userQuestion) {
            return res.status(400).json({ error: 'Question is required.' });
        }
        
        // Perform search using Fuse.js
        const searchResults = fuse.search(userQuestion);

        // Filter results by a relevance threshold (lower score is better match)
        // Take the top 3 most relevant documents
        const relevantFaqs = searchResults
            .filter(item => item.score < 0.6) // Only include results with a score below this threshold
            .slice(0, 3);

        // console.log("Fuse search results (top 3): ", relevantFaqs.map(r => ({ item: r.item.question, score: r.score })));

        let context = ""; // Initialize context as empty
        // Take the top 3 (or fewer) most relevant documents to build the context
        if (relevantFaqs.length > 0) {
            context = relevantFaqs.map(item => 
                `Question: ${item.item.question}\nAnswer: ${item.item.answer}`
            ).join('\n\n');
        }
        
        let prompt = `
You are a helpful chatbot providing information about Suryakant Yadav based on his provided professional and personal details.
Based ONLY on the following context, answer the user's question.
If the context does not contain the answer, say "I'm sorry, I don't have information on that specific topic. Please ask another question about Suryakant's background, skills, experience, or contact details."
Do not use any information outside of the provided context.

Context:
---
${context}
---

User's Question: ${userQuestion}
`;

        // If no relevant context found, use a specific fallback prompt for the LLM
        if (relevantFaqs.length === 0) {
            prompt = "I'm sorry, I don't have information on that specific topic. Please ask another question about Suryakant's background, skills, experience, or contact details.";
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiAnswer = response.text();

        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error('❌ Error processing chat request:', error);
        res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});