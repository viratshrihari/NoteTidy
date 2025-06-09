import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 NoteTidy. AI-powered study platform for students.
            </p>
          </div>
          
          <nav className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <a 
              href="mailto:support@notetidy.com" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Transform your studying with AI-powered OCR, flashcards, quizzes, and personalized study tools.
          </p>
        </div>
      </div>
    </footer>
  );
}