import { useState } from "react";
import { recognizeText } from "@/lib/tesseract";
import { extractTextFromPDF } from "@/lib/pdfExtract";

interface UseOCRResult {
  extractText: (file: File) => Promise<string>;
  isProcessing: boolean;
  error: string | null;
}

export function useOCR(): UseOCRResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = async (file: File): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        return text;
      } else {
        const text = await recognizeText(file);
        return text;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Text extraction failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return { extractText, isProcessing, error };
}
