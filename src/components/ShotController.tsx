import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ShotControllerProps {
  onShoot: (power: number, angle: number) => void;
  disabled?: boolean;
}

export const ShotController = ({ onShoot, disabled = false }: ShotControllerProps) => {
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(0);

  const handleShoot = () => {
    if (disabled) return;
    
    onShoot(power, angle);
    toast.success("Shot fired!");
    
    // Reset to default
    setPower(50);
    setAngle(0);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-gradient-card border border-primary/20 rounded-lg">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-primary">
          Power: {power}%
        </label>
        <Slider
          value={[power]}
          onValueChange={([value]) => setPower(value)}
          min={20}
          max={100}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-primary">
          Angle: {angle > 0 ? `${angle}° Right` : angle < 0 ? `${Math.abs(angle)}° Left` : 'Center'}
        </label>
        <Slider
          value={[angle]}
          onValueChange={([value]) => setAngle(value)}
          min={-45}
          max={45}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <Button
        onClick={handleShoot}
        disabled={disabled}
        className="w-full text-lg font-bold py-6"
      >
        🏓 Throw Ball
      </Button>

      {disabled && (
        <p className="text-center text-sm text-muted-foreground">
          Wait for your turn...
        </p>
      )}
    </div>
  );
};
