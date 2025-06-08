import { createWorker } from "tesseract.js";

export async function recognizeText(file: File): Promise<string> {
  const worker = await createWorker("eng");
  
  try {
    const { data: { text } } = await worker.recognize(file);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
