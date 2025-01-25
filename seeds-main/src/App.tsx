import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { PlantData } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { WhitepaperModal } from './components/WhitepaperModal';
import { PlantDetailsModal } from './components/PlantDetailsModal';
import { Home } from './pages/Home';
import { Garden } from './pages/Garden';

function App() {
  const [showAuthModal, setShowAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'forgot' }>({
    isOpen: false,
    mode: 'login'
  });
  const [showWhitepaperModal, setShowWhitepaperModal] = useState(false);
  const [showPlantDetailsModal, setShowPlantDetailsModal] = useState(false);
  const [currentPlant, setCurrentPlant] = useState<PlantData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'home' | 'garden'>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Listen for garden navigation events
    const handleNavigateGarden = () => setView('garden');
    window.addEventListener('navigate-garden', handleNavigateGarden);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate-garden', handleNavigateGarden);
    };
  }, []);

  const generatePlantDNA = async () => {
    if (!user) {
      toast.error('Please sign in to plant a seed');
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

      const plantData: Omit<PlantData, 'id'> = {
        user_id: user.id,
        species: "Digital " + Math.random().toString(36).substring(7),
        traits,
        genome: "ACTG" + Math.random().toString(36).substring(7).toUpperCase(),
        rarity,
        growth: 0,
        environment: "Optimal",
        energy: 100,
        experience: 0,
        level: 1,
        knowledge: []
      };

      const { data, error } = await supabase
        .from('plants')
        .insert([plantData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from database');

      setCurrentPlant(data);
      setShowPlantDetailsModal(true);
      toast.success('New seed planted successfully!');
      setView('garden');
    } catch (error: any) {
      console.error('Error generating plant:', error);
      toast.error(error.message || 'Failed to generate plant. Please try again later.');
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
          onGeneratePlant={generatePlantDNA}
          onOpenWhitepaper={() => setShowWhitepaperModal(true)}
          onOpenAuth={() => setShowAuthModal({ isOpen: true, mode: 'login' })}
        />
      ) : (
        <Garden />
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

      <PlantDetailsModal
        isOpen={showPlantDetailsModal}
        onClose={() => setShowPlantDetailsModal(false)}
        plant={currentPlant}
      />
    </div>
  );
}

export default App;