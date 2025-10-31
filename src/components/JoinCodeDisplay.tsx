import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JoinCodeDisplayProps {
  joinCode: string;
}

export const JoinCodeDisplay = ({ joinCode }: JoinCodeDisplayProps) => {
  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    toast.success("Code copied!");
  };

  return (
    <div className="bg-gradient-card border-2 border-primary p-6 rounded-lg shadow-glow-cyan">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Join at <span className="text-primary font-semibold">chugzone.com/join</span>
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="text-5xl font-bold tracking-widest text-primary font-mono">
            {joinCode}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyCode}
            className="border-primary hover:bg-primary/10"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
