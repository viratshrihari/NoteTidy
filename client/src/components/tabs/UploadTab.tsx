import { useState, useRef } from "react";
import { CloudUpload, Image, Copy, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOCR } from "@/hooks/useOCR";
import { useApp } from "@/contexts/AppContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function UploadTab() {
  const [extractedText, setExtractedText] = useState("");
  const [enhancedNote, setEnhancedNote] = useState<{
    title: string;
    content: string;
    keyPoints: string[];
    summary: string;
  } | null>(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { extractText, isProcessing } = useOCR();
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enhanceNoteMutation = useMutation({
    mutationFn: async (data: { messyText: string; style: string }) => {
      const response = await apiRequest("POST", "/api/notes/enhance", data);
      return response.json();
    },
    onSuccess: (enhanced) => {
      setEnhancedNote(enhanced);
      toast({
        title: "Note enhanced successfully",
        description: "AI has cleaned up and organized your notes.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to enhance note",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (noteData: { title: string; content: string; style: string; extractedText?: string }) => {
      const response = await apiRequest("POST", "/api/notes", noteData);
      return response.json();
    },
    onSuccess: (note) => {
      dispatch({ type: "ADD_NOTE", payload: note });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note saved successfully",
        description: "Your note has been saved to your collection.",
      });
      setExtractedText("");
      setEnhancedNote(null);
      setShowExtracted(false);
    },
    onError: () => {
      toast({
        title: "Failed to save note",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG).",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await extractText(file);
      setExtractedText(text);
      setShowExtracted(true);
    } catch (error) {
      toast({
        title: "OCR processing failed",
        description: "Could not extract text from the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnhanceNote = () => {
    if (!extractedText.trim()) {
      toast({
        title: "No content to enhance",
        description: "Please extract text from an image first.",
        variant: "destructive",
      });
      return;
    }

    enhanceNoteMutation.mutate({
      messyText: extractedText,
      style: state.settings.defaultNoteStyle
    });
  };

  const handleSaveNote = (useEnhanced = false) => {
    const contentToSave = useEnhanced && enhancedNote ? enhancedNote.content : extractedText;
    const titleToSave = useEnhanced && enhancedNote ? enhancedNote.title : (extractedText.split('\n')[0].slice(0, 50) || "Untitled Note");

    if (!contentToSave.trim()) {
      toast({
        title: "No content to save",
        description: "Please extract text from an image first.",
        variant: "destructive",
      });
      return;
    }

    saveNoteMutation.mutate({
      title: titleToSave,
      content: contentToSave,
      style: state.settings.defaultNoteStyle,
      extractedText
    });
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: "Text copied",
        description: "The extracted text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy text",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Upload Card */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CloudUpload className="text-primary mr-3 h-5 w-5" />
              Upload & Extract Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg mb-2">Drop images here or click to select</p>
              <p className="text-sm text-muted-foreground">Supports JPG, PNG files</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
            </div>
            
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-5 w-5 text-primary mr-3" />
                  <span className="text-sm">Processing image and extracting text...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Text Preview */}
        {showExtracted && (
          <Card className="material-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="text-secondary mr-3 h-5 w-5" />
                Extracted Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-40 resize-vertical"
                placeholder="Extracted text will appear here..."
              />
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleEnhanceNote}
                  disabled={enhanceNoteMutation.isPending}
                  className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {enhanceNoteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Enhance with AI
                </Button>
                
                <Button
                  onClick={() => handleSaveNote(false)}
                  disabled={saveNoteMutation.isPending}
                  variant="outline"
                  className="flex items-center"
                >
                  {saveNoteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Raw Text
                </Button>
                
                <Button variant="outline" onClick={handleCopyText} className="flex items-center">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Enhanced Notes Preview */}
        {enhancedNote && (
          <Card className="material-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="text-purple-500 mr-3 h-5 w-5" />
                AI Enhanced Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">{enhancedNote.title}</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {enhancedNote.content}
                  </pre>
                </div>
              </div>

              {enhancedNote.keyPoints && enhancedNote.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {enhancedNote.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {enhancedNote.summary && (
                <div>
                  <h4 className="font-medium mb-2">Summary:</h4>
                  <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    {enhancedNote.summary}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleSaveNote(true)}
                  disabled={saveNoteMutation.isPending}
                  className="flex items-center"
                >
                  {saveNoteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Enhanced Note
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(enhancedNote.content);
                    toast({
                      title: "Enhanced note copied",
                      description: "The enhanced note has been copied to your clipboard.",
                    });
                  }} 
                  className="flex items-center"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Enhanced
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  );
}
