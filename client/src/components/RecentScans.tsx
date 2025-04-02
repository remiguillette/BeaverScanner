import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlateContext } from "@/contexts/PlateContext";
import { LicensePlate } from "@shared/schema";

export default function RecentScans() {
  const { setCurrentPlate, updatePlateStatus } = usePlateContext();

  const { data: recentScans, isLoading, error } = useQuery<LicensePlate[]>({
    queryKey: ['/api/plates/recent'],
  });

  const handleViewDetails = (plate: LicensePlate) => {
    setCurrentPlate({
      plateNumber: plate.plateNumber,
      region: plate.region || "",
      status: plate.status as any,
      detectedAt: new Date(plate.detectedAt),
      details: plate.details || ""
    });
    updatePlateStatus(plate.status as any);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/20 text-green-500';
      case 'expired':
        return 'bg-orange-500/20 text-orange-500';
      case 'suspended':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border flex flex-row justify-between items-center py-3 px-4">
        <CardTitle className="font-semibold text-lg">Plaques Récentes</CardTitle>
        <Button variant="link" className="text-sm text-primary hover:underline">Voir Tout</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-border">
            <thead className="bg-background/60">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plaque</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Heure</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">Chargement...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">Erreur lors du chargement des données</td>
                </tr>
              ) : recentScans && recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-background/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{scan.plateNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(scan.detectedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge inline-flex items-center gap-1 px-2 py-1 rounded-full ${getStatusBadgeClass(scan.status)}`}>
                        <span className={`h-2 w-2 rounded-full ${
                          scan.status === 'valid' ? 'bg-green-500' :
                          scan.status === 'expired' ? 'bg-orange-500' :
                          scan.status === 'suspended' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></span>
                        {getStatusText(scan.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {scan.region || 'Inconnu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary/80 mr-2"
                        onClick={() => handleViewDetails(scan)}
                      >
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">Aucune plaque récente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
