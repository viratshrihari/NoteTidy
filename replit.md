# NoteTidy - AI Study Platform

## Project Overview
NoteTidy is a comprehensive AI-powered study platform designed for students to transform messy notes into organized, gamified learning experiences. The app combines OCR technology, AI note enhancement, and gaming elements to make studying more engaging for Gen Z students.

## Recent Changes
- **2025-01-26**: Switched OpenAI model from GPT-4o to GPT-3.5-turbo for cost efficiency (90% cost reduction)
- **2025-01-26**: Fixed critical mobile button click issues with proper touch event handling
- **2025-01-26**: Enhanced mobile experience with swipe navigation between tabs
- **2025-01-26**: Applied comprehensive mobile-first optimizations and touch targets
- **2025-01-26**: Prevented swipe gestures from interfering with button interactions
- **2025-01-26**: Created GitHub-ready documentation and deployment files

## User Preferences
- Cost-conscious: Prefer GPT-3.5-turbo over GPT-4o for API cost savings
- Mobile-first: Prioritize touch-friendly interface and mobile optimization
- Revenue-focused: Implement real AdSense monetization with strategic ad placement

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite for fast development
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Context + TanStack Query for server state
- **Mobile**: Touch-optimized with swipe gestures and responsive design
- **Monetization**: Google AdSense integration with publisher ID ca-pub-7101625990726152

### Backend (Express.js)
- **API**: RESTful Express.js server with TypeScript
- **AI**: OpenAI GPT-3.5-turbo for cost-effective AI features
- **Storage**: In-memory storage (easily upgradeable to PostgreSQL)
- **File Upload**: Multer for handling image/PDF uploads
- **OCR**: Tesseract.js for text extraction from images

### Key Features Implemented
1. **AI Note Enhancement** - Upload photos/PDFs, get AI-cleaned notes in 4 formats
2. **Smart Study Tools** - Flashcards, practice tests, concept mapping, weakness analysis
3. **Gamified Quiz Arena** - Multiple game modes with power-ups and achievements
4. **Smart Chat** - AI study assistant with note context
5. **Mobile-First Design** - Touch-friendly with swipe navigation
6. **AdSense Monetization** - Strategic ad placement for revenue generation

### AI Model Configuration
- **Current Model**: GPT-3.5-turbo (cost-optimized)
- **Usage**: All 8 AI endpoints use GPT-3.5-turbo for consistency
- **Cost Savings**: ~90% reduction compared to GPT-4o
- **Quality**: Maintains excellent educational content generation

### Mobile Optimizations
- 44px minimum touch targets (Apple standard)
- Touch event handling with proper preventDefault
- Swipe navigation between tabs
- Mobile-safe z-index hierarchy
- Touch-friendly CSS with manipulation and highlight removal
- Responsive layouts optimized for phones and tablets

### Deployment Status
- GitHub-ready with proper documentation
- Mobile-optimized and touch-responsive
- AdSense integration configured
- All AI features working with cost-effective model
- Ready for production deployment

## Development Guidelines
- Mobile-first approach for all new features
- Cost-conscious AI model selection
- Real monetization over placeholder implementations
- Touch-friendly interactions for all interactive elements
- Proper error handling and user feedback
- SEO-optimized for AdSense approval

## Technical Decisions
- **Storage**: In-memory for development speed (PostgreSQL upgrade path ready)
- **AI Model**: GPT-3.5-turbo for cost efficiency over GPT-4o
- **Mobile Strategy**: Touch events + responsive design over native app
- **Monetization**: Real AdSense integration over placeholder ads
- **Architecture**: Full-stack JavaScript for consistency and rapid development