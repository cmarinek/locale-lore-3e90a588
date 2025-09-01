import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <main className="relative">
        {children}
      </main>
    </div>
  );
};