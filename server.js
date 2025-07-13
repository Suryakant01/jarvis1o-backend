require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
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

// --- SOLUTION PART 1: A list of common words to ignore ---
const stopwords = new Set([
    'i', 'a', 'about', 'an', 'are', 'as', 'at', 'be', 'by', 'can', 'com', 'for', 'from',
    'how', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was',
    'what', 'when', 'where', 'who', 'will', 'with', 'www', 'my', 'your'
]);

app.post('/api/chat', async (req, res) => {
    try {
        const userQuestion = req.body.question;
        if (!userQuestion) {
            return res.status(400).json({ error: 'Question is required.' });
        }

        // --- SOLUTION PART 2: An improved search that ignores stopwords and finds multiple relevant docs ---

        // Filter out stopwords from the user's question for a cleaner search
        const userWords = userQuestion.toLowerCase().split(/\s+/)
            .filter(word => !stopwords.has(word));

        const scoredFaqs = faqs.map(faq => {
            const combinedKeywords = [
                ...faq.keywords,
                ...faq.question.toLowerCase().split(/\s+/).filter(word => !stopwords.has(word)),
            ];

            let score = 0;
            userWords.forEach(word => {
                if (combinedKeywords.includes(word)) {
                    score++;
                }
            });
            return { faq, score };
        });

        // Sort by score (descending) and filter out any with a score of 0
        const relevantFaqs = scoredFaqs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

        console.log("Top relevant documents found: ", relevantFaqs.slice(0, 3));

        // --- END OF NEW SEARCH LOGIC ---

        let context = "No relevant information found in the knowledge base.";
        
        // Take the top 3 (or fewer) most relevant documents to build the context
        if (relevantFaqs.length > 0) {
            context = relevantFaqs.slice(0, 3).map(item => 
                `Question: ${item.faq.question}\nAnswer: ${item.faq.answer}`
            ).join('\n\n');
        }
        
        const prompt = `
You are a helpful customer support chatbot. Based ONLY on the following context, answer the user's question.
If the context does not contain the answer, say "I'm sorry, I don't have information on that. Please ask another question about our shipping, orders, or policies."
Do not use any information outside of the provided context.

Context:
---
${context}
---

User's Question: ${userQuestion}
`;

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