import React from 'react';
import { Twitter, Github, Home, Sprout } from 'lucide-react';

interface NavbarProps {
  user: any;
  onOpenWhitepaper: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onViewChange: (view: 'home' | 'garden') => void;
  currentView: 'home' | 'garden';
}

export function Navbar({ user, onOpenWhitepaper, onOpenAuth, onLogout, onViewChange, currentView }: NavbarProps) {
  const openTwitter = () => window.open('https://x.com/seedsagent', '_blank');
  const openGithub = () => window.open('https://github.com/seedsagent/seeds', '_blank');

  return (
    <nav className="fixed w-full p-6 flex justify-between items-center z-40 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="text-xl font-bold">seeds</div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('home')}
            className={`p-2 rounded transition-colors ${
              currentView === 'home' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewChange('garden')}
            className={`p-2 rounded transition-colors ${
              currentView === 'garden' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Sprout className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={onOpenWhitepaper} 
          className="hover:text-green-400 transition-colors"
        >
          Learn More ↗
        </button>
        <div className="flex gap-4">
          <button onClick={openTwitter}>
            <Twitter className="w-5 h-5 hover:text-green-400 transition-colors cursor-pointer" />
          </button>
          <button onClick={openGithub}>
            <Github className="w-5 h-5 hover:text-green-400 transition-colors cursor-pointer" />
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome!</span>
            <button
              onClick={onLogout}
              className="bg-white text-black px-4 py-2 rounded hover:bg-green-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="bg-white text-black px-4 py-2 rounded hover:bg-green-400 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}