export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-4">Last updated: December 8, 2024</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
          <p>NoteTidy collects information you provide when using our study platform:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Notes and documents you upload for OCR processing</li>
            <li>Study progress and quiz performance data</li>
            <li>Usage analytics to improve our AI features</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide AI-powered study tools and personalized recommendations</li>
            <li>Process OCR and generate study materials</li>
            <li>Improve our machine learning algorithms</li>
            <li>Analyze usage patterns to enhance user experience</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Data Storage and Security</h2>
          <p>Your study materials are stored securely using industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Advertising</h2>
          <p>NoteTidy uses Google AdSense to display relevant advertisements. Google may use cookies and web beacons to collect information about your visits to this and other websites to provide advertisements about goods and services of interest to you.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Third-Party Services</h2>
          <p>We use OpenAI's API for AI-powered features. Your data is processed according to OpenAI's privacy policy and is not stored by OpenAI beyond the processing period.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of data collection</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@notetidy.com</p>
        </div>
      </div>
    </div>
  );
}