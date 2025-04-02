import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsData = {
  totalToday: number;
  validCount: number;
  expiredCount: number;
  suspendedCount: number;
  otherCount: number;
  regionDistribution: {
    region: string;
    percentage: number;
  }[];
};

export default function StatisticsPanel() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border py-3 px-4">
        <CardTitle className="font-semibold text-lg">Statistiques</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Chargement des statistiques...</p>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-3 border border-border/70">
                <div className="text-sm text-muted-foreground">Total Aujourd'hui</div>
                <div className="text-xl font-bold mt-1">{stats.totalToday}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/70">
                <div className="text-sm text-muted-foreground">Actives</div>
                <div className="text-xl font-bold mt-1 text-green-500">{stats.validCount}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/70">
                <div className="text-sm text-muted-foreground">Expirées</div>
                <div className="text-xl font-bold mt-1 text-orange-500">{stats.expiredCount}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/70">
                <div className="text-sm text-muted-foreground">Suspendues</div>
                <div className="text-xl font-bold mt-1 text-red-500">{stats.suspendedCount}</div>
              </div>
            </div>
            
            <div className="mt-4 bg-background rounded-lg p-4 border border-border/70">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Répartition par Origine</h3>
              <div className="space-y-2">
                {stats.regionDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{item.region}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
