import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { usePlateContext } from "@/contexts/PlateContext";
import { validatePlate } from "@/lib/plate-validator";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ManualInput() {
  const [plateNumber, setPlateNumber] = useState("");
  const [format, setFormat] = useState("CA");
  const { handlePlateDetection } = usePlateContext();

  const validateManualPlate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim()) return;
    
    try {
      const isValid = validatePlate(plateNumber, format);
      
      if (!isValid) {
        throw new Error(`Format de plaque d'immatriculation ${format} invalide`);
      }
      
      const response = await apiRequest("POST", "/api/validate", { 
        plateNumber, 
        region: format === "CA" ? "Canada" : "USA",
        detectionType: "manual"
      });
      
      const plateData = await response.json();
      handlePlateDetection(plateData);
      
    } catch (error) {
      console.error("Error validating plate:", error);
    }
  };

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border py-3 px-4">
        <CardTitle className="font-semibold text-lg">Saisie Manuelle</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form className="flex gap-4" onSubmit={validateManualPlate}>
          <div className="flex-1">
            <Input 
              type="text" 
              placeholder="Entrez un numéro de plaque (ex: CBPC 344)" 
              className="w-full bg-background border-border/70 focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            />
          </div>
          <div>
            <Button type="submit" className="bg-primary hover:bg-primary/80 text-white font-medium">
              <Search className="h-5 w-5 mr-1" />
              Vérifier
            </Button>
          </div>
        </form>
        
        <div className="mt-2">
          <Alert variant="default" className="bg-muted/50 border-border mt-2 mb-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-xs text-muted-foreground ml-2">
              {format === 'CA' 
                ? "Formats acceptés pour l'Ontario: CBPC 344, OPN 4BIZ, GVAH 823" 
                : "Formats acceptés pour les USA: AB12345, ABC123, etc."}
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className={`px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30 ${format === 'CA' ? 'bg-border/30' : ''}`}
            onClick={() => setFormat('CA')}
          >
            Ontario 🇨🇦
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className={`px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30 ${format === 'US' ? 'bg-border/30' : ''}`}
            onClick={() => setFormat('US')}
          >
            États-Unis 🇺🇸
          </Button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('CBPC 344') }}
          >
            CBPC 344
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('OPN 4BIZ') }}
          >
            OPN 4BIZ
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('GVAH 823') }}
          >
            GVAH 823
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
