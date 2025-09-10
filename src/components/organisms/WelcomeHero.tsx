import { Button } from "@/components/ui/button";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { HeroSearchBar } from "@/components/ui/hero-search-bar";

export const WelcomeHero = () => {
  console.log('WelcomeHero: Component rendering...');
  const [email, setEmail] = useState("");
  
  console.log('WelcomeHero: About to initialize hooks...');
  const { t } = useTranslation('lore');
  console.log('WelcomeHero: Translation hook initialized');
  
  const { user } = useAuth();
  console.log('WelcomeHero: Auth hook initialized, user:', user);
  
  const navigate = useNavigate();
  console.log('WelcomeHero: Navigate hook initialized');
  
  console.log('WelcomeHero: About to render JSX...');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      <HeroSearchBar className="w-full mb-16" />
      
      {/* Explore Stories Section */}
      <div className="bg-card rounded-2xl p-8 elevation-2 max-w-md mx-auto">
        {user ? (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Welcome back, {user.email?.split('@')[0]}!</h3>
            <p className="text-muted-foreground">Ready to explore more local stories?</p>
            <Button size="lg" className="w-full" onClick={() => navigate('/explore')}>
              Explore Stories
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Discover Local Stories</h3>
            <p className="text-muted-foreground">Explore fascinating stories from around the world</p>
            <Button size="lg" className="w-full" onClick={() => navigate('/explore')}>
              Explore Stories
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const features = [
  {
    icon: "🗺️",
    title: "Hidden Gems Nearby",
    description: "Uncover secret spots and local legends that only locals know about"
  },
  {
    icon: "🤝",
    title: "Community Verified",
    description: "Stories validated by real people who've been there and experienced it"
  },
  {
    icon: "📍",
    title: "Location Stories",
    description: "Every place has a story - discover the history behind familiar locations"
  }
];