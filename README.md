# 📚 Study Assistant

Study Assistant is an AI-powered web application that transforms free-form study notes into interactive flashcards and quizzes. Instead of displaying raw AI responses, the application requests structured JSON from an LLM through OpenRouter, validates the response, and renders interactive React components for an engaging learning experience.

---

## Features

- Generate flashcards from study notes
- Generate multiple-choice quizzes
- Interactive flashcard navigation
- Quiz with instant feedback and explanations
- Retry incorrectly answered questions
- Responsive design for desktop and mobile
- Loading, empty, and error states
- Robust AI response validation using Zod
- Prevents stale AI responses using AbortController

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- TanStack Query
- Zod

### Backend

- Node.js
- Express
- Axios
- dotenv

### AI

- OpenRouter API
- Google Gemini 2.5 Flash

---

## Project Structure

```
study-assistant/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── ...
│
├── server/
│   ├── src/
│   │   └── index.js
│   └── ...
│
├── shared/
│   └── schemas.ts
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd ai-study-assistant
```

---

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Backend runs at:

```
http://localhost:3001
```

---

## Application Flow

```
User Notes
      │
      ▼
React Frontend
      │
      ▼
Express Backend
      │
      ▼
OpenRouter API
(Google Gemini 2.5 Flash)
      │
      ▼
Structured JSON
      │
      ▼
Zod Validation
      │
      ▼
Interactive Flashcards & Quiz
```

---

## Prompt Engineering

The backend sends a carefully designed system prompt that instructs the model to return **only valid JSON**.

Expected response format:

```json
{
  "title": "",
  "summary": "",
  "flashcards": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "quiz": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": ""
    }
  ]
}
```

If the model wraps the response in Markdown code fences, the backend removes them before parsing.

---

## AI Integration

The application uses **OpenRouter** with the **Google Gemini 2.5 Flash** model to generate study material.

To ensure reliability:

- The backend validates the AI response using Zod.
- The frontend validates the received data again before rendering.
- Only structured JSON is accepted.
- Invalid responses never reach the UI.

---

## Error Handling

The application gracefully handles:

- Invalid JSON responses
- Unexpected response schema
- Empty AI responses
- Network failures
- API errors
- Timeout errors
- Missing API key
- Multiple rapid requests

Older requests are cancelled using **AbortController**, ensuring outdated responses cannot overwrite newer ones.

---

## Assignment Requirements Covered

- React Hooks
- Functional Components
- Free-form Text Input
- Real LLM API Integration
- Structured JSON Parsing
- Interactive Flashcards
- Interactive Quiz
- Loading State
- Empty State
- Error State
- Retry Support
- Mobile Responsive Design
- Robust AI Failure Handling

---

## AI Usage Note

AI tools were used to assist with brainstorming, code review, debugging, and improving implementation details. The project architecture, integration, testing, and final implementation were completed and verified manually.

---

## Known Limitations

- Generated study material depends on the quality of the input notes.
- AI responses may occasionally contain repetitive flashcards.
- No authentication or cloud storage.
- Study sessions are stored only for the current browser session.

---

## Future Improvements

- Save study sessions
- Export flashcards and quiz results
- Difficulty levels
- AI-powered progress tracking
- Image-based study support
- Voice-based quiz mode

---

## License

This project was created as part of a Frontend Internship assignment and is intended for educational and evaluation purposes.
