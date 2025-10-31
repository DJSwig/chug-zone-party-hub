import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GameSettings from "./pages/GameSettings";
import GamePlay from "./pages/GamePlay";
import Join from "./pages/Join";
import HorseRaceSettings from "./pages/HorseRaceSettings";
import HorseRaceHost from "./pages/HorseRaceHost";
import HorseRacePlayer from "./pages/HorseRacePlayer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/join" element={<Join />} />
          <Route path="/game/:gameId/settings" element={<GameSettings />} />
          <Route path="/game/:gameId/play" element={<GamePlay />} />
          <Route path="/game/horse-race/setup" element={<HorseRaceSettings />} />
          <Route path="/game/horse-race/host/:sessionId" element={<HorseRaceHost />} />
          <Route path="/game/horse-race/player/:sessionId/:playerId" element={<HorseRacePlayer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
