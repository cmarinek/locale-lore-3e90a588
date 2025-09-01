import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  MapPin,
  Trophy,
  Users,
  Upload,
  Settings,
  LogOut
} from 'lucide-react';

interface NavigationItemProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground ${
        isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

export function MobileNavigation() {
  const { user, signOut } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Explore LocaleLore
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center space-x-1">
            <NavigationItem to="/" icon={Home} label="Home" />
            <NavigationItem to="/explore" icon={MapPin} label="Explore" />
            <NavigationItem to="/search" icon={Search} label="Search" />
            <NavigationItem to="/social" icon={Users} label="Social" />
            <NavigationItem to="/gamification" icon={Trophy} label="Achievements" />
            
            {user && (
              <>
                <NavigationItem to="/submit" icon={Plus} label="Submit" />
                <NavigationItem to="/media" icon={Upload} label="Media" />
              </>
            )}
          </div>
        </div>
        <SheetHeader className="text-left">
          <SheetTitle>User Profile</SheetTitle>
        </SheetHeader>
        <div className="flex items-center space-x-2 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-1 p-4">
          {user && (
            <>
              <NavigationItem to={`/profile/${user.id}`} icon={User} label="Profile" />
              <NavigationItem to="/settings" icon={Settings} label="Settings" />
              <Button variant="ghost" className="justify-start" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
