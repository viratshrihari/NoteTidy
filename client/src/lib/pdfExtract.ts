export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const fileName = file.name;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    return `📄 PDF Document Uploaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: ${fileName}
Size: ${fileSize} MB
Status: Ready for processing

INSTRUCTIONS:
1. Your PDF has been successfully uploaded
2. Please copy the text content from your PDF
3. Paste it in the text area below to continue with AI enhancement
4. The AI will then format it into your selected note style

This allows you to work with PDF content while maintaining full functionality on mobile devices.`;
  } catch (error) {
    console.error('PDF processing failed:', error);
    throw new Error('Failed to process PDF file');
  }
}