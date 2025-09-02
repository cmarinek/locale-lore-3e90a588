import { Button } from "@/components/atoms";
import { InputField } from "@/components/molecules/InputField";
import { useState } from "react";
export const WelcomeHero = () => {
  const [email, setEmail] = useState("");
  return <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Content */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Locale Lore
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">Discover and explore local stories, culture, and hidden gems in your area.
Know a good spot? Add it!</p>
        </div>

        {/* Feature Cards */}
        

        {/* CTA Section */}
        <div className="bg-card rounded-2xl p-8 elevation-2 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Join our Early Adopters Program</h3>
          <div className="space-y-4">
            <InputField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" description="We'll send you updates about new features" />
            <Button size="lg" className="w-full">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
const features = [{
  icon: "⚡",
  title: "Fast & Modern",
  description: "Built with Vite, React 18, and TypeScript for optimal performance"
}, {
  icon: "📱",
  title: "Mobile First",
  description: "iOS-inspired design with PWA capabilities for native-like experience"
}, {
  icon: "🎨",
  title: "Design System",
  description: "Atomic design principles with shadcn/ui and Tailwind CSS"
}];