import { useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

type SoundMap = {
  [key: string]: Howl;
};

type VolumeMap = {
  [key: string]: number;
};

export function useAudio() {
  const [sounds, setSounds] = useState<SoundMap>({});
  const [volumes, setVolumes] = useState<VolumeMap>({
    valid: 80,
    expired: 90,
    suspended: 100,
    other: 85
  });
  const [isMuted, setIsMuted] = useState(false);
  
  // Initialize sounds
  useEffect(() => {
    const soundMap: SoundMap = {
      valid: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'],
        volume: volumes.valid / 100,
        html5: true
      }),
      expired: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/1864/1864-preview.mp3'],
        volume: volumes.expired / 100,
        html5: true
      }),
      suspended: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3'],
        volume: volumes.suspended / 100,
        html5: true
      }),
      other: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'],
        volume: volumes.other / 100,
        html5: true
      })
    };
    
    setSounds(soundMap);
    
    return () => {
      // Stop all sounds when component unmounts
      Object.values(soundMap).forEach(sound => {
        sound.stop();
      });
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    Object.entries(sounds).forEach(([key, sound]) => {
      sound.volume(volumes[key] / 100);
    });
  }, [volumes, sounds]);
  
  const playSound = useCallback((status: string) => {
    if (isMuted) return;
    
    const sound = sounds[status];
    if (sound) {
      sound.stop();
      sound.play();
    }
  }, [sounds, isMuted]);
  
  const setVolume = useCallback((status: string, volume: number) => {
    setVolumes(prev => ({
      ...prev,
      [status]: volume
    }));
    
    const sound = sounds[status];
    if (sound) {
      sound.volume(volume / 100);
    }
  }, [sounds]);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  return { playSound, setVolume, volumes, isMuted, toggleMute };
}
