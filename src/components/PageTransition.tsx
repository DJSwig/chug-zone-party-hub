import { useEffect, useState } from "react";
import { LoadingAnimation } from "./LoadingAnimation";

interface PageTransitionProps {
  children: React.ReactNode;
  loading?: boolean;
}

export const PageTransition = ({ children, loading = false }: PageTransitionProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};
