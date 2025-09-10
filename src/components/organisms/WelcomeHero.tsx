import { Button } from "@/components/ui/button";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
import { useTranslation } from '@/hooks/useSafeTranslation';
import { useAuth } from "@/contexts/AuthContext";
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
  return <div className="flex flex-col items-center justify-center px-4 py-12">
      <HeroSearchBar className="w-full" />
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