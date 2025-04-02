import { usePlateContext } from "@/contexts/PlateContext";

export default function Footer() {
  const { webSocketConnected } = usePlateContext();
  
  return (
    <footer className="bg-card border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeaverPlate - Système de Reconnaissance de Plaques
          </div>
          <div className="mt-2 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <span>{webSocketConnected ? 'Connexion WebSocket active' : 'Connexion WebSocket inactive'}</span>
            </div>
            <button className="text-sm text-primary hover:underline">
              Support Technique
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
