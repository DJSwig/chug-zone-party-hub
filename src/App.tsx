import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import GameSettings from "./pages/GameSettings";
import GamePlay from "./pages/GamePlay";
import Join from "./pages/Join";
import HorseRaceSettings from "./pages/HorseRaceSettings";
import HorseRaceHost from "./pages/HorseRaceHost";
import HorseRacePlayer from "./pages/HorseRacePlayer";
import BeerPongSettings from "./pages/BeerPongSettings";
import BeerPongHost from "./pages/BeerPongHost";
import BeerPongPlayer from "./pages/BeerPongPlayer";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import Customization from "./pages/Customization";
import NotFound from "./pages/NotFound";
import { AdminNotesOverlay } from "./components/AdminNotesOverlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminNotesOverlay />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/join" element={<Join />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/discord/callback" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/customization" element={<Customization />} />
            <Route path="/game/:gameId/settings" element={<GameSettings />} />
            <Route path="/game/:gameId/play" element={<GamePlay />} />
            <Route path="/game/horse-race/setup" element={<HorseRaceSettings />} />
            <Route path="/game/horse-race/host/:sessionId" element={<HorseRaceHost />} />
            <Route path="/game/horse-race/player/:sessionId/:playerId" element={<HorseRacePlayer />} />
            <Route path="/game/beer-pong/setup" element={<BeerPongSettings />} />
            <Route path="/game/beer-pong/host/:sessionId" element={<BeerPongHost />} />
            <Route path="/game/beer-pong/player/:sessionId/:playerId" element={<BeerPongPlayer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
