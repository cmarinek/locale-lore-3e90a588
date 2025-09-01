import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from "@/components/templates/MainLayout";
import { WelcomeHero } from "@/components/organisms/WelcomeHero";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Locale Lore</h1>
          <div className="flex gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center">
                  Welcome back!
                </span>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
        <WelcomeHero />
      </div>
    </MainLayout>
  );
};

export default Index;
