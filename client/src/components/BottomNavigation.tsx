import { CloudUpload, StickyNote, MessageCircle, Settings } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const tabs = [
  { id: "uploadTab", label: "Upload", icon: CloudUpload },
  { id: "notesTab", label: "My Notes", icon: StickyNote },
  { id: "chatTab", label: "Smart Chat", icon: MessageCircle },
  { id: "settingsTab", label: "Settings", icon: Settings },
];

export function BottomNavigation() {
  const { state, dispatch } = useApp();

  const handleTabClick = (tabId: string) => {
    dispatch({ type: "SET_TAB", payload: tabId });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-card border-t border-border px-4 py-2 z-40">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`tab-button flex flex-col items-center py-2 px-3 rounded-lg transition-colors touch-target ${
              state.currentTab === id ? "active" : ""
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
