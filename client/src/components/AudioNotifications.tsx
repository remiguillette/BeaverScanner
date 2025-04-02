import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";

export default function AudioNotifications() {
  const { playSound, setVolume, volumes, isMuted, toggleMute } = useAudio();
  
  const handleVolumeChange = (status: string, value: number[]) => {
    setVolume(status, value[0]);
  };

  const statusTypes = [
    { key: 'valid', label: 'Valide', color: 'bg-green-500' },
    { key: 'expired', label: 'Expirée', color: 'bg-orange-500' },
    { key: 'suspended', label: 'Suspendue', color: 'bg-red-500' },
    { key: 'other', label: 'Autre', color: 'bg-gray-500' }
  ];

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border py-3 px-4">
        <CardTitle className="font-semibold text-lg">Notifications Audio</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {statusTypes.map((status) => (
            <div key={status.key} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${status.color} mr-2`}></div>
                <span>{status.label}</span>
              </div>
              <div className="flex items-center">
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => playSound(status.key)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Button>
                <Slider 
                  className="ml-2 w-20"
                  value={[volumes[status.key] || 80]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={(value) => handleVolumeChange(status.key, value)}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sound-toggle" 
                checked={!isMuted}
                onCheckedChange={toggleMute}
              />
              <label 
                htmlFor="sound-toggle" 
                className="text-sm cursor-pointer"
              >
                Activer tous les sons
              </label>
            </div>
            <div>
              <Button 
                variant="outline"
                className="bg-background hover:bg-border/40 px-3 py-1 rounded text-sm"
                onClick={() => {
                  setVolume('valid', 80);
                  setVolume('expired', 90);
                  setVolume('suspended', 100);
                  setVolume('other', 85);
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
