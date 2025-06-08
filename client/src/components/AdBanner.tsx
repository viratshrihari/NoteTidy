import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AdBannerProps {
  position: "top" | "bottom" | "sidebar";
  size?: "small" | "medium" | "large";
  dismissible?: boolean;
}

export function AdBanner({ position, size = "medium", dismissible = true }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState<{
    title: string;
    description: string;
    cta: string;
    link: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    // Simulate loading different ad content based on position and size
    const ads = [
      {
        title: "Study Better with Premium",
        description: "Unlock unlimited notes, advanced AI features, and study analytics",
        cta: "Upgrade Now",
        link: "#premium",
        image: "📚"
      },
      {
        title: "Focus Music for Students",
        description: "Scientifically proven study playlists to boost concentration",
        cta: "Listen Free",
        link: "#music",
        image: "🎵"
      },
      {
        title: "Online Tutoring Platform",
        description: "Get 1-on-1 help from expert tutors in any subject",
        cta: "Find Tutor",
        link: "#tutoring",
        image: "👨‍🏫"
      },
      {
        title: "Student Laptop Deals",
        description: "Special discounts on laptops perfect for studying",
        cta: "Shop Now",
        link: "#laptops",
        image: "💻"
      }
    ];

    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAdContent(randomAd);
  }, []);

  if (!isVisible || !adContent) return null;

  const getAdStyles = () => {
    const baseStyles = "relative overflow-hidden";
    
    switch (size) {
      case "small":
        return `${baseStyles} h-16 text-xs`;
      case "large":
        return `${baseStyles} h-32 text-sm`;
      default:
        return `${baseStyles} h-24 text-sm`;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20";
      case "bottom":
        return "fixed bottom-16 left-0 right-0 z-40 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20";
      case "sidebar":
        return "bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg";
      default:
        return "";
    }
  };

  return (
    <Card className={`${getAdStyles()} ${getPositionStyles()} border-l-4 border-l-blue-500`}>
      <div className="flex items-center justify-between h-full px-4 py-2">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-2xl">{adContent.image}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {adContent.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {adContent.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
            onClick={() => window.open(adContent.link, '_blank')}
          >
            {adContent.cta}
          </Button>
          
          {dismissible && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="p-1 h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md">
        Ad
      </div>
    </Card>
  );
}

// Native ad component that blends with content
export function NativeAd({ className = "" }: { className?: string }) {
  const [adData, setAdData] = useState<{
    title: string;
    description: string;
    cta: string;
    link: string;
    sponsored: string;
  } | null>(null);

  useEffect(() => {
    // Simulate loading sponsored content
    const nativeAds = [
      {
        title: "Boost Your Study Score by 40%",
        description: "Students using active recall techniques see dramatic grade improvements. Try our proven study method.",
        cta: "Learn More",
        link: "#study-method",
        sponsored: "StudyPro"
      },
      {
        title: "Free Note Templates for Every Subject",
        description: "Download professionally designed note templates used by top students worldwide.",
        cta: "Download Free",
        link: "#templates",
        sponsored: "EduTools"
      }
    ];

    const randomAd = nativeAds[Math.floor(Math.random() * nativeAds.length)];
    setAdData(randomAd);
  }, []);

  if (!adData) return null;

  return (
    <Card className={`p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
          Sponsored by {adData.sponsored}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {adData.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {adData.description}
      </p>
      
      <Button
        size="sm"
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
        onClick={() => window.open(adData.link, '_blank')}
      >
        {adData.cta}
      </Button>
    </Card>
  );
}