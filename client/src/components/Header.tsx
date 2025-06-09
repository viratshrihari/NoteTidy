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
    <header className="bg-primary dark:bg-primary text-white mobile-header sticky top-0 safe-area-inset">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <span className="text-base font-bold">N</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold leading-tight">NoteTidy</h1>
            <span className="text-xs text-white/80 leading-tight">AI Study Platform</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-12 w-12 rounded-full hover:bg-white hover:bg-opacity-20 transition-all text-white hover:text-white touch-manipulation active:scale-95"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className="h-12 w-12 rounded-full hover:bg-white hover:bg-opacity-20 transition-all text-white hover:text-white touch-manipulation active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
