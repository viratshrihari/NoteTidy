import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoteCard } from "@/components/NoteCard";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@shared/schema";

export function NotesTab() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes", { search: searchQuery, style: filterType }],
    enabled: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const handleFilter = (type: string) => {
    setFilterType(type);
    dispatch({ type: "SET_FILTER_TYPE", payload: type });
  };

  const handleCreateNote = () => {
    // TODO: Implement new note creation modal
    console.log("Create new note");
  };

  const handleNoteClick = (note: Note) => {
    // TODO: Implement note editing modal
    console.log("Open note:", note);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-medium">My Notes</h2>
            
            <Button onClick={handleCreateNote} className="flex items-center justify-center sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={handleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="cornell">Cornell Style</SelectItem>
                <SelectItem value="bullet">Bullet Points</SelectItem>
                <SelectItem value="mindmap">Mind Map</SelectItem>
                <SelectItem value="freeform">Free Form</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterType !== "all" 
                ? "No notes match your search criteria" 
                : "Start by uploading an image or creating a new note"
              }
            </p>
            <Button onClick={handleCreateNote}>
              Create Your First Note
            </Button>
          </div>
        )}
        
      </div>
    </div>
  );
}
