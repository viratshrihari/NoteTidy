export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-4">Last updated: December 8, 2024</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Acceptance of Terms</h2>
          <p>By accessing and using NoteTidy, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Description of Service</h2>
          <p>NoteTidy is an AI-powered study platform that provides:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>OCR processing for handwritten and printed notes</li>
            <li>AI-generated flashcards and study materials</li>
            <li>Interactive quizzes and practice tests</li>
            <li>Personalized study recommendations</li>
            <li>Note organization and enhancement tools</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information when using our services</li>
            <li>Use the platform for educational purposes only</li>
            <li>Not upload copyrighted material without permission</li>
            <li>Respect intellectual property rights</li>
            <li>Not attempt to reverse engineer our AI algorithms</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Content Ownership</h2>
          <p>You retain ownership of the notes and materials you upload. By using our service, you grant NoteTidy a license to process and analyze your content to provide AI-powered features.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Limitation of Liability</h2>
          <p>NoteTidy is provided "as is" without warranties. We are not liable for any damages arising from the use of our platform, including but not limited to data loss, academic performance, or technical issues.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Advertising</h2>
          <p>Our platform displays advertisements to support free access to study tools. Ad content is provided by third-party networks and does not constitute endorsement by NoteTidy.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Termination</h2>
          <p>We reserve the right to terminate or suspend access to our service for violations of these terms or for any reason at our discretion.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of new terms.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact Information</h2>
          <p>For questions about these Terms of Service, contact us at legal@notetidy.com</p>
        </div>
      </div>
    </div>
  );
}