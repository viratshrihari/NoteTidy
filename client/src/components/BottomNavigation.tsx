import { CloudUpload, StickyNote, MessageCircle, Settings, Gamepad2, Brain } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const tabs = [
  { id: "uploadTab", label: "Upload", icon: CloudUpload },
  { id: "notesTab", label: "My Notes", icon: StickyNote },
  { id: "studyToolsTab", label: "Study Tools", icon: Brain },
  { id: "quizTab", label: "Quiz Arena", icon: Gamepad2 },
  { id: "chatTab", label: "Smart Chat", icon: MessageCircle },
  { id: "settingsTab", label: "Settings", icon: Settings },
];

export function BottomNavigation() {
  const { state, dispatch } = useApp();

  const handleTabClick = (tabId: string) => {
    dispatch({ type: "SET_TAB", payload: tabId });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border mobile-nav safe-area-inset">
      <div className="flex justify-around px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTabClick(id);
            }}
            className={`mobile-nav-item mobile-button touch-target ${
              state.currentTab === id 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground active:bg-muted/50"
            }`}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 50
            }}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium truncate px-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
