import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePlateContext } from "@/contexts/PlateContext";
import { validatePlate } from "@/lib/plate-validator";
import { apiRequest } from "@/lib/queryClient";

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
              placeholder="Entrez un numéro de plaque (ex: ABC-123)" 
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
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className={`px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30 ${format === 'CA' ? 'bg-border/30' : ''}`}
            onClick={() => setFormat('CA')}
          >
            Format CA 🇨🇦
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className={`px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30 ${format === 'US' ? 'bg-border/30' : ''}`}
            onClick={() => setFormat('US')}
          >
            Format US 🇺🇸
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('ABC-123') }}
          >
            Québec
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('ABCD-123') }}
          >
            Ontario
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 py-1 bg-background border-border rounded-md text-sm hover:bg-border/30"
            onClick={() => { setFormat('CA'); setPlateNumber('AB123C') }}
          >
            Colombie-Britannique
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
