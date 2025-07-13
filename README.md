
# 🤖 Personal AI FAQ Chatbot (Jarvis-1o)

This project implements a personalized AI-powered FAQ chatbot designed to answer questions about a specific individual (Suryakant Yadav), leveraging Google's Gemini AI model and a custom Retrieval Augmented Generation (RAG) system. It provides a clean, interactive chat interface built with React.js.

## ✨ Features

*   **Retrieval Augmented Generation (RAG) Architecture:** Efficiently retrieves relevant information from a predefined JSON knowledge base (`data/faqs.json`) before generating responses with Gemini. This ensures answers are grounded in your provided personal data.
*   **Personalized Knowledge Base:** Answers questions about the owner's professional background, skills, work experience, education, contact information, and more. It is easily customizable by editing `backend/data/faqs.json`.
*   **Intelligent Information Retrieval:**
    *   **Stopword Filtering:** Removes common words from user queries and FAQ keywords to improve search relevance.
    *   **Keyword Matching & Scoring:** Identifies and scores the most relevant FAQ documents based on keyword matches, dynamically selecting the top 3 (or fewer) for context.
*   **Google Gemini 1.5 Flash Integration:** Leverages a powerful, cost-effective LLM for natural language understanding and coherent answer generation.
*   **Strict Context Adherence:** The LLM is explicitly prompted to answer *only* from the provided context, minimizing hallucinations and ensuring factual accuracy based on your data. If no relevant information is found, it provides a polite fallback message.
*   **User-Friendly Chat Interface:** A clean and responsive React frontend provides an intuitive way to interact with the bot.
*   **Typing Indicator:** Enhances user experience by showing when the bot is processing a response.
*   **Cross-Origin Resource Sharing (CORS):** Configured to allow communication between the frontend and backend.

## 🚀 Technologies Used

This project is a full-stack application composed of a Node.js backend and a React.js frontend, structured as a monorepo.

### Backend (`backend/`)

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
*   **Google Generative AI SDK (`@google/generative-ai`):** Official SDK for interacting with Google's Gemini models.
*   **`dotenv`:** For managing environment variables.
*   **`cors`:** Middleware for enabling CORS.
*   **`fs`:** Node.js built-in module for file system operations (loading `faqs.json`).
*   **`nodemon`:** (Dev Dependency) Automatically restarts the Node.js server upon file changes.

### Frontend (`frontend/`)

*   **React.js:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **CSS:** For styling the chat interface.

## ⚙️ Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (comes with Node.js)
*   A Google Cloud Project with the Gemini API enabled and an API key. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Clone the repository

```bash
git clone <repository_url>
cd jarvis-1o # Or whatever your project folder is called
```

### 2. Backend Setup

Navigate into the `backend` directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory (at the same level as `server.js`) and add your Gemini API key:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**Important:** Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

### 3. Customize Your Knowledge Base

Edit the `backend/data/faqs.json` file to include your personal and professional information. This is your core knowledge base for the chatbot.

**Structure of `faqs.json`:**

```json
[
  {
    "question": "Your natural language question",
    "answer": "The concise answer to that question.",
    "keywords": ["list", "of", "relevant", "words", "for", "retrieval"]
  },
  // Add more objects as needed
]
```

*   **`question`**: A typical question a user might ask to get this information.
*   **`answer`**: The direct, factual response.
*   **`keywords`**: A crucial list of words that are synonyms or closely related to the `question` and `answer`. These help the bot find the correct piece of information even if the user's query isn't an exact match. Include variations, specific names, technologies, etc.

### 4. Frontend Setup

Navigate into the `frontend` directory:

```bash
cd ../frontend
```

Install frontend dependencies:

```bash
npm install
```

### 5. Running the Application

First, start the backend server:

```bash
cd ../backend
npm run dev
# You should see: 🚀 Server is running at http://localhost:5001
# And: ✅ FAQ data loaded successfully.
```

In a **new terminal window**, navigate to the `frontend` directory and start the frontend development server:

```bash
cd ../frontend
npm run dev
# You should see something like: 
# Local: http://localhost:5173/
# press h + enter to show help
```

Open your browser and navigate to the `Local` address (e.g., `http://localhost:5173/`).

## 💬 Usage

Once both the backend and frontend are running, you can interact with your personal AI chatbot:

1.  Type a question in the input field at the bottom of the chat interface.
2.  Press Enter or click the "Send" button.
3.  The chatbot will process your question, find relevant information from your `faqs.json`, and generate an answer using the Gemini AI.

**Examples of questions you can ask (based on the provided `faqs.json` for Suryakant Yadav):**

*   "What's your full name?"
*   "What is your professional background?"
*   "Tell me about your key skills."
*   "Where do you work currently?"
*   "What's your educational background?"
*   "How can I contact you for professional inquiries?"
*   "Are you open to remote work or relocation?"
*   "What are your career goals?"
*   "Do you have a portfolio?"
*   "What are your hobbies outside of work?"
*   "Can you tell me about a React project you've built?"
*   "What's your experience with Next.js?"
*   "How do you handle state in React apps?"
*   "What's your learning approach for new tech?"

## 💡 Future Enhancements

*   **Improved Search Algorithm:** While a custom scoring mechanism is in place, integrating a dedicated fuzzy search library like `fuse.js` (already listed as a dependency in `backend/package.json` but not currently used for document search in `server.js`) could provide more sophisticated and accurate document retrieval.
*   **Semantic Search:** Implement embedding-based search for truly understanding the meaning of queries, rather than just keyword matching.
*   **Admin Panel:** A web interface for easily adding, editing, and deleting FAQ entries without direct JSON file manipulation.
*   **Chat History Persistence:** Store chat conversations (e.g., in local storage or a database) for a more continuous user experience.
*   **Multi-turn Conversations:** Enhance the RAG system to maintain context over several turns of conversation.
*   **Error Handling & UI Feedback:** More detailed error messages and loading states in the UI.

## 🤝 Contributing

Feel free to fork this repository, open issues, or submit pull requests.

## 📄 License

This project is licensed under the ISC License. See the `LICENSE` file in the backend directory for details.

---

**Author:** TheMyth
