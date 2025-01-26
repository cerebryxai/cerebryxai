import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { EntityData } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { WhitepaperModal } from './components/WhitepaperModal';
import { EntityDetailsModal } from './components/EntityDetailsModal';
import { Home } from './pages/Home';
import { Lab } from './pages/Lab';

function App() {
  const [showAuthModal, setShowAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'forgot' }>({
    isOpen: false,
    mode: 'login'
  });
  const [showWhitepaperModal, setShowWhitepaperModal] = useState(false);
  const [showEntityDetailsModal, setShowEntityDetailsModal] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<EntityData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'home' | 'lab'>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Listen for lab navigation events
    const handleNavigateLab = () => setView('lab');
    window.addEventListener('navigate-lab', handleNavigateLab);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate-lab', handleNavigateLab);
    };
  }, []);

  const generateEntityDNA = async () => {
    if (!user) {
      toast.error('Please sign in to create a new entity');
      setShowAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    try {
      // Generate more unique traits based on rarity
      const rarity = Math.random() > 0.95 ? "Legendary" : Math.random() > 0.8 ? "Rare" : "Common";
      
      const traitPools = {
        Legendary: [
          ["Quantum Processing", "Time Manipulation", "Reality Bending", "Dimensional Shift"],
          ["Neural Synthesis", "Cosmic Awareness", "Infinite Learning", "Quantum Entanglement"],
          ["Universal Adaptation", "Temporal Cognition", "Multidimensional Thinking"]
        ],
        Rare: [
          ["Advanced Learning", "Parallel Processing", "Pattern Recognition", "Energy Manipulation"],
          ["Adaptive Evolution", "Deep Intuition", "Quantum Computing", "Neural Enhancement"],
          ["Rapid Growth", "Collective Intelligence", "Synergistic Thinking"]
        ],
        Common: [
          ["Self-Learning", "Data Analysis", "Problem Solving", "Pattern Matching"],
          ["Adaptive Behavior", "Basic Evolution", "Neural Growth", "Energy Efficiency"],
          ["Quick Learning", "Collaborative Spirit", "Logical Thinking"]
        ]
      };

      // Select random traits from the appropriate pool
      const getRandomTrait = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];
      const traits = traitPools[rarity as keyof typeof traitPools].map(getRandomTrait);

      const entityData: Omit<EntityData, 'id'> = {
        user_id: user.id,
        name: "AI " + Math.random().toString(36).substring(7),
        traits,
        dna: "ACTG" + Math.random().toString(36).substring(7).toUpperCase(),
        rarity,
        energy: 100,
        experience: 0,
        level: 1
      };

      const { data, error } = await supabase
        .from('entities')
        .insert([entityData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from database');

      setCurrentEntity(data);
      setShowEntityDetailsModal(true);
      toast.success('New entity created successfully!');
      setView('lab');
    } catch (error: any) {
      console.error('Error generating entity:', error);
      toast.error(error.message || 'Failed to generate entity. Please try again later.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Toaster position="top-center" />
      
      <Navbar
        user={user}
        onOpenWhitepaper={() => setShowWhitepaperModal(true)}
        onOpenAuth={() => setShowAuthModal({ isOpen: true, mode: 'login' })}
        onLogout={handleLogout}
        onViewChange={setView}
        currentView={view}
      />

      {view === 'home' ? (
        <Home
          user={user}
          onGenerateEntity={generateEntityDNA}
          onOpenWhitepaper={() => setShowWhitepaperModal(true)}
          onOpenAuth={() => setShowAuthModal({ isOpen: true, mode: 'login' })}
        />
      ) : (
        <Lab />
      )}

      <AuthModal
        isOpen={showAuthModal.isOpen}
        onClose={() => setShowAuthModal({ ...showAuthModal, isOpen: false })}
        mode={showAuthModal.mode}
        setAuthModal={setShowAuthModal}
      />

      <WhitepaperModal
        isOpen={showWhitepaperModal}
        onClose={() => setShowWhitepaperModal(false)}
      />

      <EntityDetailsModal
        isOpen={showEntityDetailsModal}
        onClose={() => setShowEntityDetailsModal(false)}
        entity={currentEntity}
      />
    </div>
  );
}

export default App;
