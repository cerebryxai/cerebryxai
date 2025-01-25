import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PlantData, PlantMessage } from '../types';
import { MessageSquare, Brain, Leaf, X } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  plant: PlantData;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary': return '#ffd700'; // Gold
    case 'Rare': return '#3b82f6'; // Blue
    case 'Common': return '#48bb78'; // Green
    default: return '#9ca3af'; // Gray
  }
};

export function Garden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const [hoveredPlant, setHoveredPlant] = useState<PlantData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [messages, setMessages] = useState<PlantMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load plants and messages
  useEffect(() => {
    const loadPlants = async () => {
      const { data: plants, error } = await supabase
        .from('plants')
        .select(`
          *,
          user_profile:user_profile_id (
            username
          )
        `);

      if (error) {
        console.error('Error loading plants:', error);
        return;
      }

      if (!plants) return;

      // Initialize nodes with random positions
      nodesRef.current = plants.map(plant => ({
        id: plant.id!,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        plant
      }));
    };

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('plant_messages')
        .select(`
          *,
          plants (
            *,
            user_profile:user_profile_id (
              username
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    };

    loadPlants();
    loadMessages();

    // Subscribe to new plants
    const plantSubscription = supabase
      .channel('plants')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'plants' 
      }, () => {
        loadPlants(); // Reload all plants when there are changes
      })
      .subscribe();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('plant_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'plant_messages' 
      }, payload => {
        setMessages(prev => [payload.new as PlantMessage, ...prev]);
      })
      .subscribe();

    return () => {
      plantSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  }, [dimensions]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Update node positions
      nodesRef.current.forEach(node => {
        // Add some random movement
        node.vx += (Math.random() - 0.5) * 0.1;
        node.vy += (Math.random() - 0.5) * 0.1;

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x <= 0 || node.x >= dimensions.width) node.vx *= -0.8;
        if (node.y <= 0 || node.y >= dimensions.height) node.vy *= -0.8;

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = getRarityColor(node.plant.rarity);
        ctx.fill();

        // Add glow effect for Legendary plants
        if (node.plant.rarity === 'Legendary') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw connections
        nodesRef.current.forEach(otherNode => {
          if (node.id === otherNode.id) return;
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(150 - distance) / 150 * 0.2})`;
            ctx.stroke();
          }
        });
      });

      ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest node
    let closestNode = null;
    let closestDistance = Infinity;

    nodesRef.current.forEach(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance && distance < 30) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    setHoveredPlant(closestNode?.plant || null);
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400';
      case 'Rare': return 'text-blue-400';
      case 'Common': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden pt-[72px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredPlant(null)}
      />
      
      {/* Hover Info */}
      {hoveredPlant && (
        <div className="fixed top-20 left-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 max-w-xs animate-fade-in">
          <h3 className="text-xl font-bold mb-2">{hoveredPlant.species}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-400">
              Created by {(hoveredPlant as any).user_profile?.username || 'Unknown'}
            </p>
            <p className="text-gray-400">Level {hoveredPlant.level}</p>
            <p className="text-gray-400">
              Rarity: <span className={getRarityTextColor(hoveredPlant.rarity)}>{hoveredPlant.rarity}</span>
            </p>
            <p className="text-gray-400">Experience: {hoveredPlant.experience}/100</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {hoveredPlant.traits.map((trait, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs">{trait}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed top-32 right-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:border-green-400 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Chat Log */}
      <div className={`fixed top-32 right-4 w-96 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Garden Chat Log
          </h3>
          <button 
            onClick={() => setShowChat(false)}
            className="hover:text-green-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[600px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className="animate-fade-in">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  message.type === 'user' ? 'bg-white' : getRarityTextColor(message.plants?.rarity || 'Common')
                }`} />
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {message.type === 'user' ? (
                      <>Human ({(message.plants as any)?.user_profile?.username || 'Unknown'})</>
                    ) : (
                      <>{message.plants?.species}</>
                    )}
                    {message.plants?.rarity && message.type !== 'user' && (
                      <span className={`ml-2 ${getRarityTextColor(message.plants.rarity)}`}>
                        {message.plants.rarity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}