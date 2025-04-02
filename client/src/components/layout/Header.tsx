import { usePlateContext } from "@/contexts/PlateContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { webSocketConnected } = usePlateContext();
  
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
          <h1 className="ml-2 text-xl font-semibold text-primary">Beaver Plate</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'} mr-2 ${webSocketConnected ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm">{webSocketConnected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
          <Button className="bg-primary hover:bg-primary/80 text-white font-medium px-4 py-2">
            Paramètres
          </Button>
        </div>
      </div>
    </header>
  );
}
