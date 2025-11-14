import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        navigate('/search');
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts help
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        // Could open a modal with all shortcuts
        console.log('Keyboard shortcuts help');
      }

      // Escape: Close modals/dialogs (handled by components)
      // This is just a reminder that Escape should work everywhere
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.addEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};

// Export keyboard shortcuts configuration for documentation
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    metaKey: true,
    ctrlKey: true,
    action: () => {},
    description: 'Open search',
  },
  {
    key: '/',
    metaKey: true,
    ctrlKey: true,
    action: () => {},
    description: 'Show keyboard shortcuts',
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Close modals and dialogs',
  },
];
