# NoteTidy 📚

An AI-powered study platform that transforms messy notes into organized, gamified learning experiences for students.

## Features

🎯 **AI Note Enhancement** - Upload photos/PDFs and get AI-cleaned notes in multiple formats (Cornell, Bullet Points, Mind Maps, Freeform)

🧠 **Smart Study Tools**
- Interactive flashcards with difficulty tracking
- AI-generated practice tests
- Concept connection mapping
- Personalized weakness analysis and coaching

🎮 **Gamified Quiz Arena** - Turn studying into games with:
- Multiple game modes (Speed Challenge, Survival, Focus Mode)
- Power-ups and achievements
- Streak tracking and leaderboards
- Gaming elements designed for Gen Z students

💬 **Smart Chat** - AI study assistant for questions and explanations

📱 **Mobile-First Design** - Optimized for phones and tablets with:
- Touch-friendly interface
- Swipe navigation between tabs
- Responsive layouts
- Native app-like experience

💰 **Monetization Ready** - Integrated Google AdSense with strategic ad placement

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack Query
- **Backend**: Express.js + TypeScript
- **AI**: OpenAI GPT-4o for note enhancement and study tools
- **OCR**: Tesseract.js for text extraction
- **Storage**: In-memory storage (easily upgradeable to PostgreSQL)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/notetidy.git
cd notetidy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. **Upload Notes**: Take photos of handwritten notes or upload PDFs
2. **AI Enhancement**: Let AI clean up and organize your notes in your preferred format
3. **Study Tools**: Generate flashcards, practice tests, and get personalized study insights
4. **Quiz Arena**: Play gamified quizzes to test your knowledge
5. **Smart Chat**: Ask questions about your notes and get AI explanations

## Deployment

The app is ready for deployment on Replit or any Node.js hosting platform. All dependencies are configured and the build process is optimized.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ for students who want to make studying more engaging and effective.