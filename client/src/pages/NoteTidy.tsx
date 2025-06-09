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

export default function NoteTidy() {
  const { state } = useApp();

  const handleQuickNote = () => {
    // TODO: Implement quick note creation modal
    console.log("Quick note");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top Banner Ad */}
      <AdSenseBanner adSlot="1234567890" height="90px" className="sticky top-16 z-30" />
      
      <main className="flex-1 pt-4">
        
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
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full material-shadow-lg transition-all duration-300 hover:scale-105 p-0"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      <Footer />
    </div>
  );
}
