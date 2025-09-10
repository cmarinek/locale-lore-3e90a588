import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

export const JoinSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Don't render if user is authenticated
  if (user) return null;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-card rounded-2xl p-8 elevation-2 text-center">
          <h3 className="text-xl font-semibold mb-4">Join LocaleLore Community</h3>
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};