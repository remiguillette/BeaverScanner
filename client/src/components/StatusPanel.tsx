import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlateContext } from "@/contexts/PlateContext";

export default function StatusPanel() {
  const { currentPlate, plateStatus } = usePlateContext();

  const getStatusClass = () => {
    switch (plateStatus) {
      case 'valid':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'expired':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      case 'suspended':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (plateStatus) {
      case 'valid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'expired':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'suspended':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (plateStatus) {
      case 'valid':
        return 'Valide';
      case 'expired':
        return 'Expirée';
      case 'suspended':
        return 'Suspendue';
      default:
        return 'Autre';
    }
  };

  const getStatusDescription = () => {
    switch (plateStatus) {
      case 'valid':
        return 'Plaque en règle';
      case 'expired':
        return 'La plaque a expiré';
      case 'suspended':
        return 'La plaque est suspendue';
      default:
        return 'Statut inconnu';
    }
  };

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border py-3 px-4">
        <CardTitle className="font-semibold text-lg">Statut Actuel</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {currentPlate ? (
          <>
            <div className="flex items-center justify-center mb-4">
              {/* Ontario license plate display */}
              <div className="bg-[#f0f0f0] text-[#003087] w-72 h-20 rounded-md border-2 border-[#666] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-xs text-center absolute top-1 w-full">ONTARIO</div>
                <div className="text-3xl font-bold tracking-wider leading-none mt-2">
                  {currentPlate.plateNumber}
                </div>
                <div className="text-xs text-center absolute bottom-1 w-full">YOURS TO DISCOVER</div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Animated status indicator */}
            <div className={`rounded-lg p-4 border mb-4 ${getStatusClass()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center bg-${plateStatus === 'valid' ? 'green' : plateStatus === 'expired' ? 'orange' : plateStatus === 'suspended' ? 'red' : 'gray'}-500/20`}>
                    {getStatusIcon()}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">{getStatusText()}</h3>
                    <p className="text-sm text-muted-foreground">{getStatusDescription()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs bg-${plateStatus === 'valid' ? 'green' : plateStatus === 'expired' ? 'orange' : plateStatus === 'suspended' ? 'red' : 'gray'}-500/20 px-2 py-1 rounded-full`}>
                    {plateStatus === 'valid' ? '100%' : plateStatus === 'expired' ? '0%' : '0%'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Province/État:</span>
                <span className="font-medium">{currentPlate.region || 'Inconnu'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date d'expiration:</span>
                <span className="font-medium">
                  {plateStatus === 'expired' 
                    ? 'Expirée' 
                    : plateStatus === 'valid' 
                      ? new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString() 
                      : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type de véhicule:</span>
                <span className="font-medium">Berline</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dernière vérification:</span>
                <span className="font-medium">
                  {currentPlate.detectedAt.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 border-t border-border pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes:</h3>
              <p className="text-sm">
                {currentPlate.details || 
                  (plateStatus === 'valid' 
                    ? 'Aucune restriction trouvée. Véhicule en règle.' 
                    : plateStatus === 'expired'
                      ? 'La plaque a expiré. Renouvellement requis.'
                      : plateStatus === 'suspended'
                        ? 'Plaque suspendue. Action requise par les autorités.'
                        : 'Information non disponible.')}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Aucune plaque détectée</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
