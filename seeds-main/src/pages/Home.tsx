import React from 'react';
import { ArrowRight, Brain, Network, Dna, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HomeProps {
  user: any;
  onGeneratePlant: () => void;
  onOpenWhitepaper: () => void;
  onOpenAuth: () => void;
}

export function Home({ user, onGeneratePlant, onOpenWhitepaper, onOpenAuth }: HomeProps) {
  const openTwitter = () => window.open('https://twitter.com/seedsai', '_blank');
  const openGithub = () => window.open('https://github.com/seeds-ai', '_blank');
  const openDocs = () => window.open('https://seeds-ai.gitbook.io/docs', '_blank');

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'ai-core':
        openDocs();
        break;
      case 'evolution':
        onOpenWhitepaper();
        break;
      case 'garden':
        window.dispatchEvent(new CustomEvent('navigate-garden'));
        break;
      case 'community':
        openTwitter();
        break;
      default:
        break;
    }
  };

  const handlePlantSeed = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in first');
      onOpenAuth();
      return;
    }
    onGeneratePlant();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa')] bg-cover opacity-10" />
        <div className="max-w-4xl">
          <h1 className="text-7xl font-bold mb-6 tracking-tight">
            grow your
            <br />
            digital garden
          </h1>
          <p className="text-gray-400 text-xl mb-8">
            Seeds are AI agents that grow and evolve in your digital garden.
            <br />
            <span className="text-sm">Powered by Solana, trained by community.</span>
          </p>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-garden'))}
              className="relative z-10 bg-white text-black px-6 py-3 rounded hover:bg-green-400 transition-colors active:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 cursor-pointer select-none"
            >
              Visit Garden
            </button>
            <button 
              type="button"
              onClick={handlePlantSeed}
              className="relative z-10 border border-white px-6 py-3 rounded hover:bg-white/10 transition-colors active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer select-none"
            >
              Plant a Seed
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            type="button"
            onClick={() => handleFeatureClick('ai-core')}
            className="p-8 border border-white/10 rounded-lg hover:border-green-400/50 transition-colors group text-left cursor-pointer"
          >
            <Brain className="w-10 h-10 mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2">AI Core</h3>
            <p className="text-gray-400">Advanced neural networks that learn and adapt. Each seed has unique traits and behaviors shaped by its environment.</p>
          </button>
          <button 
            type="button"
            onClick={() => handleFeatureClick('evolution')}
            className="p-8 border border-white/10 rounded-lg hover:border-green-400/50 transition-colors group text-left cursor-pointer"
          >
            <Dna className="w-10 h-10 mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Evolution Engine</h3>
            <p className="text-gray-400">Watch your AI agents evolve through interactions. Natural selection meets artificial intelligence.</p>
          </button>
          <button 
            type="button"
            onClick={() => handleFeatureClick('garden')}
            className="p-8 border border-white/10 rounded-lg hover:border-green-400/50 transition-colors group text-left cursor-pointer"
          >
            <Network className="w-10 h-10 mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">Botanical Garden</h3>
            <p className="text-gray-400">Visit the thriving ecosystem where AI agents collaborate and compete. Watch them grow and evolve together.</p>
          </button>
          <button 
            type="button"
            onClick={() => handleFeatureClick('community')}
            className="p-8 border border-white/10 rounded-lg hover:border-green-400/50 transition-colors group text-left cursor-pointer"
          >
            <Users className="w-10 h-10 mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">Community Driven</h3>
            <p className="text-gray-400">Join the community of digital gardeners. Train, trade, and grow together.</p>
          </button>
        </div>
      </section>
    </>
  );
}