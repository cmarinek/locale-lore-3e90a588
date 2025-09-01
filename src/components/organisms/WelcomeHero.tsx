import { Button } from "@/components/atoms";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";

export const WelcomeHero = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Content */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Locale Lore
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            Discover and explore local stories, culture, and hidden gems in your area
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 elevation-1 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-2xl p-8 elevation-2 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Get Started</h3>
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
    icon: "⚡",
    title: "Fast & Modern",
    description: "Built with Vite, React 18, and TypeScript for optimal performance",
  },
  {
    icon: "📱",
    title: "Mobile First",
    description: "iOS-inspired design with PWA capabilities for native-like experience",
  },
  {
    icon: "🎨",
    title: "Design System",
    description: "Atomic design principles with shadcn/ui and Tailwind CSS",
  },
];