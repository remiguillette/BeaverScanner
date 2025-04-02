import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Scanner from "@/components/Scanner";
import ManualInput from "@/components/ManualInput";
import RecentScans from "@/components/RecentScans";
import StatusPanel from "@/components/StatusPanel";
import StatisticsPanel from "@/components/StatisticsPanel";
import AudioNotifications from "@/components/AudioNotifications";
import { usePlateContext } from "@/contexts/PlateContext";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const { connected, messages } = useWebSocket();
  const { setWebSocketConnected, handlePlateDetection } = usePlateContext();
  
  useEffect(() => {
    setWebSocketConnected(connected);
  }, [connected, setWebSocketConnected]);
  
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === "PLATE_DETECTED" || latestMessage.type === "PLATE_VALIDATED") {
        handlePlateDetection(latestMessage.data);
      }
    }
  }, [messages, handlePlateDetection]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Scanner />
            <ManualInput />
            <RecentScans />
          </div>
          
          <div className="space-y-6">
            <StatusPanel />
            <StatisticsPanel />
            <AudioNotifications />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
