import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ios-card';
import { Input } from '@/components/ui/ios-input';
import { Badge } from '@/components/ui/ios-badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/ios-sheet';
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText } from '@/components/ui/ios-skeleton';
import { MainLayout } from '@/components/templates/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Star, 
  Download, 
  Share2, 
  Settings, 
  User, 
  Mail, 
  Lock,
  ChevronRight,
  Plus
} from 'lucide-react';

const ComponentShowcase = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'ios' = 'default') => {
    const messages = {
      default: { title: "Default Toast", description: "This is a default notification" },
      destructive: { title: "Error", description: "Something went wrong!" },
      success: { title: "Success", description: "Action completed successfully" },
      warning: { title: "Warning", description: "Please check your input" },
      info: { title: "Information", description: "Here's some useful info" },
      ios: { title: "iOS Style", description: "Beautiful iOS-inspired design" }
    };

    toast({
      title: messages[variant].title,
      description: messages[variant].description,
      variant: variant as any,
    });
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            iOS-Inspired Components
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive design system with haptic feedback, smooth animations, and iOS-inspired aesthetics
          </p>
        </div>

        {/* Button Showcase */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Button Variants
            </CardTitle>
            <CardDescription>
              Buttons with haptic feedback and smooth animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="ios">iOS Style</Button>
              <Button variant="glass">Glass</Button>
              <Button variant="floating" size="icon-lg">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Showcase */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Card Variants
            </CardTitle>
            <CardDescription>
              Cards with subtle elevation and rounded corners
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Default Card</h3>
                    <p className="text-sm text-muted-foreground">Standard elevation</p>
                  </div>
                </div>
                <p className="text-sm">This is a default card with standard styling.</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Elevated Card</h3>
                    <p className="text-sm text-muted-foreground">Higher elevation</p>
                  </div>
                </div>
                <p className="text-sm">This card has enhanced elevation for prominence.</p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Glass Card</h3>
                    <p className="text-sm text-muted-foreground">Glassmorphism effect</p>
                  </div>
                </div>
                <p className="text-sm">Beautiful glass effect with backdrop blur.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Input Showcase */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Form Components
            </CardTitle>
            <CardDescription>
              Inputs with floating labels and smooth transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input placeholder="Standard input" />
                <Input variant="floating" label="Email" type="email" />
                <Input variant="floating" label="Password" type="password" />
              </div>
              <div className="space-y-4">
                <Input inputSize="sm" placeholder="Small input" />
                <Input inputSize="default" placeholder="Default input" />
                <Input inputSize="lg" placeholder="Large input" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Showcase */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Badges & Chips
            </CardTitle>
            <CardDescription>
              Tags, categories, and notification badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="ios">iOS Style</Badge>
              <Badge variant="glass">Glass Effect</Badge>
              <Badge variant="notification">3</Badge>
              <Badge variant="chip" dismissible>Dismissible chip</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
              <Badge size="icon">🔥</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Loading States
            </CardTitle>
            <CardDescription>
              Skeleton loaders with smooth animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={simulateLoading} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Simulate Loading'}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                <SkeletonCard />
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <SkeletonAvatar size="lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <SkeletonText lines={4} />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-muted-foreground">Software Engineer</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Passionate about creating beautiful user interfaces and smooth user experiences.
                      Always learning new technologies and sharing knowledge with the community.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Sarah Wilson</h3>
                        <p className="text-sm text-muted-foreground">UI/UX Designer</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Focused on user-centered design and creating delightful digital experiences.
                      Believes in the power of good design to solve complex problems.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toast & Sheet Demo */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              Interactive Components
            </CardTitle>
            <CardDescription>
              Sheets, modals, and toast notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Toast Notifications</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => showToast('default')}>
                    Default
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('success')}>
                    Success
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('warning')}>
                    Warning
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('destructive')}>
                    Error
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('info')}>
                    Info
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('ios')}>
                    iOS Style
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Sheet Components</h4>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ios" className="w-full">
                      Open Settings Sheet
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Settings</SheetTitle>
                      <SheetDescription>
                        Manage your account settings and preferences.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <span>Profile Settings</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <span>Email Preferences</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                          <span>Privacy & Security</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ComponentShowcase;