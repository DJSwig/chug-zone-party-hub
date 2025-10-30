export const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative">
        {/* Animated shot glasses */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-12 h-16 bg-gradient-primary rounded-b-lg animate-shot-bounce shadow-glow-cyan"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        
        {/* ChugZone text */}
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
            ChugZone
          </h2>
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-loading-dot"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
