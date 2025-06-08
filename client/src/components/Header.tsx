import { Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { dispatch } = useApp();

  const handleSettingsClick = () => {
    dispatch({ type: "SET_TAB", payload: "settingsTab" });
  };

  return (
    <header className="bg-primary dark:bg-primary text-white material-shadow sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
            <span className="text-sm font-bold">N</span>
          </div>
          <h1 className="text-lg font-medium">NoteFlow</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsClick}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
