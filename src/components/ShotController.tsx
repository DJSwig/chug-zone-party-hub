import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Zap, Target } from "lucide-react";

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
    toast.success("Shot fired! 🏓");
    
    // Reset to default
    setPower(50);
    setAngle(0);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-gradient-card border-2 border-primary/20 rounded-lg shadow-glow-cyan">
      <div className="text-center mb-4">
        <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
        <h3 className="text-lg font-bold text-primary">Shot Controls</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Power
            </label>
            <span className="text-lg font-bold text-primary">{power}%</span>
          </div>
          <Slider
            value={[power]}
            onValueChange={([value]) => setPower(value)}
            min={20}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Angle
            </label>
            <span className="text-lg font-bold text-primary">
              {angle > 0 ? `${angle}° R` : angle < 0 ? `${Math.abs(angle)}° L` : 'Center'}
            </span>
          </div>
          <Slider
            value={[angle]}
            onValueChange={([value]) => setAngle(value)}
            min={-45}
            max={45}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>← Left</span>
            <span>Center</span>
            <span>Right →</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleShoot}
        disabled={disabled}
        className="w-full text-xl font-bold py-7 shadow-glow-cyan hover:scale-105 transition-transform"
        size="lg"
      >
        {disabled ? (
          <>⏳ Wait for your turn</>
        ) : (
          <>🏓 Throw Ball</>
        )}
      </Button>

      {disabled && (
        <p className="text-center text-sm text-muted-foreground italic animate-pulse">
          Stand by for your shot...
        </p>
      )}
    </div>
  );
};
