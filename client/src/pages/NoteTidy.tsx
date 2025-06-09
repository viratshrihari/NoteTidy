import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { UploadTab } from "@/components/tabs/UploadTab";
import { NotesTab } from "@/components/tabs/NotesTab";
import { StudyToolsTab } from "@/components/tabs/StudyToolsTab";
import { QuizTab } from "@/components/tabs/QuizTab";
import { ChatTab } from "@/components/tabs/ChatTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { AdSenseBanner } from "@/components/GoogleAdsense";
import { Footer } from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";

export default function NoteTidy() {
  const { state, dispatch } = useApp();

  const tabs = ["uploadTab", "notesTab", "studyToolsTab", "quizTab", "chatTab", "settingsTab"];
  const currentTabIndex = tabs.indexOf(state.currentTab);

  const navigateToTab = (direction: number) => {
    const newIndex = currentTabIndex + direction;
    if (newIndex >= 0 && newIndex < tabs.length) {
      dispatch({ type: "SET_TAB", payload: tabs[newIndex] });
    }
  };

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => navigateToTab(1),
    onSwipeRight: () => navigateToTab(-1),
    threshold: 100
  });

  const handleQuickNote = () => {
    dispatch({ type: "SET_TAB", payload: "uploadTab" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top Banner Ad */}
      <AdSenseBanner adSlot="1234567890" height="90px" className="sticky top-20 z-30" />
      
      <main ref={swipeRef} className="flex-1 px-4 pb-24 mobile-scroll swipeable">
        
        {/* Upload Notes Tab */}
        <div className={`tab-content ${state.currentTab === "uploadTab" ? "active" : ""}`}>
          <UploadTab />
        </div>

        {/* My Notes Tab */}
        <div className={`tab-content ${state.currentTab === "notesTab" ? "active" : ""}`}>
          <NotesTab />
        </div>

        {/* Study Tools Tab */}
        <div className={`tab-content ${state.currentTab === "studyToolsTab" ? "active" : ""}`}>
          <StudyToolsTab />
        </div>

        {/* Quiz Arena Tab */}
        <div className={`tab-content ${state.currentTab === "quizTab" ? "active" : ""}`}>
          <QuizTab />
        </div>

        {/* Smart Chat Tab */}
        <div className={`tab-content ${state.currentTab === "chatTab" ? "active" : ""}`}>
          <ChatTab />
        </div>

        {/* Settings Tab */}
        <div className={`tab-content ${state.currentTab === "settingsTab" ? "active" : ""}`}>
          <SettingsTab />
        </div>

      </main>

      <BottomNavigation />
      
      {/* Bottom Banner Ad */}
      <AdSenseBanner adSlot="0987654321" height="60px" className="fixed bottom-16 left-0 right-0 z-30" />

      {/* Floating Action Button */}
      <Button
        onClick={handleQuickNote}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleQuickNote();
        }}
        className="mobile-fab mobile-button touch-target bg-primary hover:bg-primary/90 text-white shadow-xl"
        size="icon"
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          pointerEvents: 'auto',
          position: 'fixed',
          zIndex: 60
        }}
      >
        <Plus className="h-7 w-7" />
      </Button>
      
      <Footer />
    </div>
  );
}
