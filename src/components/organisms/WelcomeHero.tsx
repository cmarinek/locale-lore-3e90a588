import { Button } from "@/components/ui/button";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { HeroSearchBar } from "@/components/ui/hero-search-bar";
export const WelcomeHero = () => {
  console.log('WelcomeHero: Component rendering...');
  const [email, setEmail] = useState("");
  console.log('WelcomeHero: About to initialize hooks...');
  const {
    t
  } = useTranslation('lore');
  console.log('WelcomeHero: Translation hook initialized');
  const {
    user
  } = useAuth();
  console.log('WelcomeHero: Auth hook initialized, user:', user);
  const navigate = useNavigate();
  console.log('WelcomeHero: Navigate hook initialized');
  console.log('WelcomeHero: About to render JSX...');
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Discover
            </span>{' '}
            <span className="text-foreground">
              Local Stories
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('welcome.subtitle', 'Uncover fascinating tales, legends, and hidden gems in your neighborhood and beyond')}
          </p>

          {/* Search bar */}
          <div className="mb-8">
            <HeroSearchBar className="w-full max-w-2xl mx-auto" />
          </div>

          {/* Action buttons */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                {t('auth.signup', 'Join Community')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/auth')}
                className="px-8 py-3"
              >
                <LogIn className="mr-2 h-5 w-5" />
                {t('auth.signin', 'Sign In')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/explore')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              >
                <span className="mr-2">🗺️</span>
                {t('actions.explore', 'Explore Stories')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/submit')}
                className="px-8 py-3"
              >
                <span className="mr-2">📝</span>
                {t('actions.submit', 'Share Your Story')}
              </Button>
            </div>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const features = [{
  icon: "🗺️",
  title: "Hidden Gems Nearby",
  description: "Uncover secret spots and local legends that only locals know about"
}, {
  icon: "🤝",
  title: "Community Verified",
  description: "Stories validated by real people who've been there and experienced it"
}, {
  icon: "📍",
  title: "Location Stories",
  description: "Every place has a story - discover the history behind familiar locations"
}];