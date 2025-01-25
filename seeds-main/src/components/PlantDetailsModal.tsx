import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { PlantData, PlantMessage } from '../types';
import { Brain, Dna, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generatePlantResponse } from '../lib/openai';
import { toast } from 'react-hot-toast';

interface PlantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: PlantData | null;
}

export function PlantDetailsModal({ isOpen, onClose, plant }: PlantDetailsModalProps) {
  const [messages, setMessages] = useState<PlantMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plant?.id) {
      loadMessages();
    }
  }, [plant?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!plant?.id) return;

    const { data, error } = await supabase
      .from('plant_messages')
      .select('*')
      .eq('plant_id', plant.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant || !newMessage.trim() || loading) return;

    setLoading(true);
    try {
      // Get AI response
      const response = await generatePlantResponse(plant, newMessage);

      // Save user message
      const { error: userMsgError } = await supabase
        .from('plant_messages')
        .insert({
          plant_id: plant.id,
          content: newMessage,
          type: 'user'
        });

      if (userMsgError) throw userMsgError;

      // Save plant response
      const { error: plantMsgError } = await supabase
        .from('plant_messages')
        .insert({
          plant_id: plant.id,
          content: response,
          type: 'plant'
        });

      if (plantMsgError) throw plantMsgError;

      // Reload messages
      await loadMessages();
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!plant) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400';
      case 'Rare': return 'text-blue-400';
      case 'Common': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-yellow-400/20';
      case 'Rare': return 'border-blue-400/20';
      case 'Common': return 'border-green-400/20';
      default: return 'border-white/10';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Digital Plant"
    >
      <div className="space-y-4">
        <div className={`p-4 border rounded ${getRarityBorderColor(plant.rarity)}`}>
          <h4 className="font-bold text-green-400">Species</h4>
          <p>{plant.species}</p>
          <div className="mt-2 text-sm">
            <span className="text-gray-400">Level {plant.level || 1} • </span>
            <span className={`font-bold ${getRarityColor(plant.rarity)}`}>{plant.rarity}</span>
          </div>
        </div>

        <div className="p-4 border border-white/10 rounded">
          <h4 className="font-bold text-purple-400">Traits</h4>
          <ul className="list-disc list-inside">
            {plant.traits.map((trait, i) => (
              <li key={i} className="text-gray-300">{trait}</li>
            ))}
          </ul>
        </div>

        {/* Chat Section */}
        <div className="border border-white/10 rounded">
          <div className="p-4 border-b border-white/10">
            <h4 className="font-bold text-blue-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation
            </h4>
          </div>
          <div className="h-[200px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded ${
                    msg.type === 'user'
                      ? 'bg-white/10'
                      : getRarityBorderColor(plant.rarity) + ' bg-black'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-black border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-green-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="bg-white text-black px-4 py-2 rounded hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}