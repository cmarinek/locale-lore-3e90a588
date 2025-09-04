
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Settings,
  Shield,
  User
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  // Only essential header actions for desktop
  const headerActions = user ? [
    ...(isAdmin ? [{ 
      path: '/admin', 
      icon: Shield, 
      label: 'Admin'
    }] : []),
    { 
      path: `/profile/${user.id}`, 
      icon: User, 
      label: 'Profile'
    }
  ] : [
    { 
      path: '/auth', 
      icon: User, 
      label: 'Login'
    }
  ];

  return (
    // Desktop only - minimal header actions
    <nav className="hidden md:flex items-center space-x-1">
      {headerActions.map(({ path, icon: Icon, label }) => (
        <Link key={path} to={path}>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        </Link>
      ))}
    </nav>
  );
};
