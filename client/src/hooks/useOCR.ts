import { useState } from "react";
import { recognizeText } from "@/lib/tesseract";

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
      const text = await recognizeText(file);
      return text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract text from image";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return { extractText, isProcessing, error };
}
