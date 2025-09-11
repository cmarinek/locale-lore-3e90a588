import { Button } from "@/components/ui/button";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { HeroSearchBar } from "@/components/ui/hero-search-bar";
export const WelcomeHero = () => {
  const [email, setEmail] = useState("");
  const {
    t
  } = useTranslation('lore');
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  return <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading */}
            
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">Learn and share what's around you</p>

            {/* Search bar */}
            <div className="mb-8">
              <HeroSearchBar className="w-full max-w-2xl mx-auto" />
            </div>

          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {features.map((feature, index) => <div key={index} className="text-center bg-card p-6 rounded-lg border">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </div>;
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