import { Button } from "@/components/ui/button";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export const WelcomeHero = () => {
  console.log('WelcomeHero rendering...');
  const [email, setEmail] = useState("");
  const { t } = useTranslation('lore');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Content */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-card p-6 rounded-xl elevation-1 hover-scale">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-2xl p-8 elevation-2 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Become an early contributor</h3>
          <div className="space-y-4">
            <InputField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              description="We'll send you updates about new features" 
            />
            <Button size="lg" className="w-full">
              Subscribe
            </Button>
          </div>
        </div>
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