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
    <>
      {/* DEBUG BANNER - Remove after fixing */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '10px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        🚨 DEBUG: WelcomeHero is rendering! If you see this, the app works but CSS is hiding content.
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5" style={{
        minHeight: '100vh',
        backgroundColor: '#f0f0f0', /* Fallback gray background */
        border: '5px solid red' /* Debug border */
      }}>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{
              color: '#000000' /* Force black text */
            }}>
              <span style={{color: '#0066cc'}}>Discover</span>{' '}
              <span style={{color: '#333333'}}>Local Stories</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{
              color: '#666666' /* Force gray text */
            }}>
              Uncover fascinating tales, legends, and hidden gems in your neighborhood and beyond
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
                  style={{
                    backgroundColor: '#0066cc',
                    color: '#ffffff',
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/auth')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0066cc',
                    padding: '12px 32px',
                    border: '2px solid #0066cc',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/explore')}
                  style={{
                    backgroundColor: '#0066cc',
                    color: '#ffffff',
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <span className="mr-2">🗺️</span>
                  Explore Stories
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/submit')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0066cc',
                    padding: '12px 32px',
                    border: '2px solid #0066cc',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <span className="mr-2">📝</span>
                  Share Your Story
                </Button>
              </div>
            )}
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center" style={{
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{color: '#333333'}}>{feature.title}</h3>
                <p style={{color: '#666666'}} className="text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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