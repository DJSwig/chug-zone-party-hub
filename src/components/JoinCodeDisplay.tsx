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
    <div className="bg-gradient-card border border-primary p-3 rounded-lg shadow-glow-cyan inline-block">
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Join: <span className="text-primary font-semibold">chugzone.com/join</span>
          </p>
          <div className="text-3xl font-bold tracking-widest text-primary font-mono">
            {joinCode}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={copyCode}
          className="border-primary hover:bg-primary/10 h-8 w-8"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
