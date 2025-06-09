import { useEffect } from "react";

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

export function GoogleAdSense({ 
  adSlot, 
  adFormat = "auto", 
  style = {},
  className = ""
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000"}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Banner ad component
export function AdSenseBanner({ 
  adSlot, 
  className = "",
  height = "90px" 
}: { 
  adSlot: string; 
  className?: string; 
  height?: string; 
}) {
  return (
    <GoogleAdSense
      adSlot={adSlot}
      adFormat="horizontal"
      className={`w-full ${className}`}
      style={{ minHeight: height }}
    />
  );
}

// Rectangle ad component
export function AdSenseRectangle({ 
  adSlot, 
  className = "" 
}: { 
  adSlot: string; 
  className?: string; 
}) {
  return (
    <GoogleAdSense
      adSlot={adSlot}
      adFormat="rectangle"
      className={`mx-auto ${className}`}
      style={{ width: "300px", height: "250px" }}
    />
  );
}

// In-feed ad component
export function AdSenseInFeed({ 
  adSlot, 
  className = "" 
}: { 
  adSlot: string; 
  className?: string; 
}) {
  return (
    <div className={`p-4 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
      <GoogleAdSense
        adSlot={adSlot}
        adFormat="auto"
        className="w-full"
      />
    </div>
  );
}