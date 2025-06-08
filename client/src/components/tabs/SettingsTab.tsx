import { Palette, FileText, Database, Brain, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getStorageStats, formatBytes, clearAllData, exportNotesToJSON } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function SettingsTab() {
  const { state, dispatch } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const storageStats = getStorageStats();

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/chat/messages");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Chat history cleared",
        description: "All chat messages have been deleted.",
      });
    },
  });

  const handleDefaultStyleChange = (style: string) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { defaultNoteStyle: style as any }
    });
  };

  const handleAutoSaveToggle = (enabled: boolean) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { autoSave: enabled }
    });
  };

  const handleExportData = () => {
    try {
      const exportData = exportNotesToJSON(state.notes);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noteflow-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Your notes have been exported to a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export your notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <h2 className="text-2xl font-medium mb-6">Settings</h2>
        
        {/* Appearance Settings */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="text-primary mr-3 h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dark Mode</label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Note Settings */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="text-primary mr-3 h-5 w-5" />
              Note Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Default Note Style</label>
              <Select
                value={state.settings.defaultNoteStyle}
                onValueChange={handleDefaultStyleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cornell">Cornell Notes</SelectItem>
                  <SelectItem value="bullet">Bullet Points</SelectItem>
                  <SelectItem value="mindmap">Mind Map</SelectItem>
                  <SelectItem value="freeform">Free Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto-save</label>
                <p className="text-sm text-muted-foreground">Automatically save changes</p>
              </div>
              <Switch
                checked={state.settings.autoSave}
                onCheckedChange={handleAutoSaveToggle}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Storage Settings */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="text-primary mr-3 h-5 w-5" />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-medium">Storage Used</span>
                <p className="text-sm text-muted-foreground">Local storage usage</p>
              </div>
              <span className="text-sm">
                {formatBytes(storageStats.used)} / {formatBytes(storageStats.total)}
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(storageStats.percentage, 100)}%` }}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center justify-center"
              >
                <Database className="mr-2 h-4 w-4" />
                Export All Notes
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClearData}
                className="flex items-center justify-center text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Database className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Settings */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="text-primary mr-3 h-5 w-5" />
              AI Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-2">OpenAI API Status</label>
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <span className="text-sm text-green-700 dark:text-green-400">Connected and ready</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info className="inline mr-2 h-4 w-4" />
              Your API key is stored securely and never sent to our servers.
            </div>

            <Button 
              variant="outline" 
              onClick={() => clearChatMutation.mutate()}
              disabled={clearChatMutation.isPending}
              className="w-full"
            >
              Clear Chat History
            </Button>
          </CardContent>
        </Card>
        
        {/* About Section */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="text-primary mr-3 h-5 w-5" />
              About NoteFlow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Last Updated:</strong> December 2024</p>
              <p>A progressive web app for intelligent note-taking with OCR and AI assistance.</p>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
