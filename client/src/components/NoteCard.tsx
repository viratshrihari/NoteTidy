import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Note } from "@shared/schema";
import { useApp } from "@/contexts/AppContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

const styleColors = {
  cornell: "bg-primary",
  bullet: "bg-secondary",
  mindmap: "bg-yellow-500",
  freeform: "bg-purple-500",
};

const styleLabels = {
  cornell: "Cornell",
  bullet: "Bullet Points",
  mindmap: "Mind Map",
  freeform: "Free Form",
};

export function NoteCard({ note, onClick }: NoteCardProps) {
  const { dispatch } = useApp();
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      dispatch({ type: "DELETE_NOTE", payload: note.id });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(note.id);
    }
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).length;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <Card 
      className="material-shadow hover:material-shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 ${styleColors[note.style as keyof typeof styleColors]} rounded-full mr-2`}></span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {styleLabels[note.style as keyof typeof styleLabels]}
            </span>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="p-1 text-muted-foreground hover:text-destructive"
              disabled={deleteNoteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mb-2 line-clamp-2">
          {note.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {note.content}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTimeAgo(note.createdAt)}</span>
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            <span>{getWordCount(note.content)} words</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
