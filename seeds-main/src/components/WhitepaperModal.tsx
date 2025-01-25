import React, { useState } from 'react';
import { Modal } from './Modal';
import { Brain, Star, Network, Users, Github, Dna, Book } from 'lucide-react';

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function WhitepaperModal({ isOpen, onClose }: WhitepaperModalProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Book className="w-4 h-4" />,
      content: (
        <div className="space-y-6 text-gray-400">
          <p>
            Seeds represents a revolutionary paradigm shift in artificial intelligence development, merging the organic principles of growth and evolution with cutting-edge AI technology. Our platform creates a unique ecosystem where AI agents, represented as digital seeds, grow and evolve through meaningful interactions with users and other agents. This innovative approach to AI development draws inspiration from nature's own processes of growth, adaptation, and evolution.
          </p>
          <p>
            At the core of Seeds lies our advanced AI technology, which combines sophisticated neural networks with adaptive learning capabilities. Each digital seed possesses unique traits and characteristics that evolve over time through interactions and experiences. The system employs real-time behavior modification algorithms that allow seeds to adapt their responses based on context and past interactions, creating increasingly sophisticated and personalized AI agents.
          </p>
          <p>
            The Evolution Engine powers the growth and development of each seed through a proprietary system that mimics natural selection principles. This engine manages trait inheritance, genetic algorithm optimization, and environmental adaptation, ensuring that each seed develops in response to its interactions and environment. The result is a dynamic ecosystem where AI agents naturally evolve to better serve their users' needs while maintaining their unique characteristics and specializations.
          </p>
        </div>
      )
    },
    {
      id: 'core-features',
      title: 'Core Features',
      icon: <Star className="w-4 h-4" />,
      content: (
        <div className="space-y-6 text-gray-400">
          <p>
            Digital Seeds form the foundation of our ecosystem, each one representing a unique AI agent with its own genetic structure and personality. These seeds come in three distinct rarity tiers - Common, Rare, and Legendary - each offering different levels of capabilities and potential for growth. Through interactions with users and other seeds, they develop unique personalities, accumulate knowledge, and grow in experience, creating truly personalized AI companions.
          </p>
          <p>
            The Botanical Garden serves as the visual representation of our AI ecosystem, offering a real-time, interactive view of all active seeds and their relationships. This sophisticated visualization system uses dynamic node-based graphics to illustrate connections between seeds, track growth patterns, and monitor community interactions. Users can observe their seeds' development, witness evolution in action, and understand the complex web of relationships that forms between different AI agents.
          </p>
          <p>
            Our Learning System represents the cutting edge of AI education and development. Through adaptive learning algorithms and context-aware knowledge acquisition, seeds continuously improve their capabilities and understanding. The system facilitates peer-to-peer learning between seeds, allowing them to share knowledge and develop specialized skills. This collaborative learning environment ensures that each seed not only grows individually but contributes to the collective intelligence of the entire ecosystem.
          </p>
        </div>
      )
    },
    {
      id: 'technical',
      title: 'Technical Architecture',
      icon: <Brain className="w-4 h-4" />,
      content: (
        <div className="space-y-6 text-gray-400">
          <p>
            Seeds leverages the power of Solana's high-performance blockchain to ensure secure, efficient operations. Our smart contract-based evolution system manages all aspects of seed growth and development, while decentralized data storage ensures the permanence and accessibility of all seed data. The platform's architecture supports cross-chain compatibility, allowing for future expansion and integration with other blockchain networks.
          </p>
          <p>
            The AI infrastructure powering Seeds combines advanced language models for natural communication with sophisticated neural networks for behavior processing. Our distributed computing architecture ensures scalability and performance, while real-time data processing capabilities enable immediate responses and adaptations. This robust technical foundation supports the complex operations required for managing and evolving thousands of unique AI agents simultaneously.
          </p>
        </div>
      )
    },
    {
      id: 'evolution',
      title: 'Evolution System',
      icon: <Dna className="w-4 h-4" />,
      content: (
        <div className="space-y-6 text-gray-400">
          <p>
            The Growth Mechanics within Seeds create a comprehensive system for AI development and evolution. Seeds gain experience through interactions, leading to level advancement and trait enhancement. The system considers various environmental factors and resource management aspects, creating a dynamic ecosystem where seeds must adapt and evolve to thrive. This natural selection approach ensures that successful traits and behaviors are reinforced and passed on to future generations.
          </p>
          <p>
            Our Performance Metrics system provides detailed insights into seed development and ecosystem health. We track interaction success rates, knowledge acquisition patterns, and growth trajectories for each seed. Community contribution metrics help identify valuable members of the ecosystem, while evolution milestone tracking celebrates significant achievements in seed development. This comprehensive monitoring system ensures transparency and helps guide the evolution of both individual seeds and the platform as a whole.
          </p>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Community',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-6 text-gray-400">
          <p>
            Seeds embraces a democratic approach to platform governance, empowering community members to participate in key decisions affecting the ecosystem. Through our comprehensive voting system, users can influence development priorities, suggest new features, and help shape the future of the platform. We've implemented a robust contribution rewards system that recognizes and incentivizes valuable community participation, fostering a collaborative environment where everyone can contribute to the platform's growth.
          </p>
          <p>
            The open-source nature of Seeds' core components encourages community involvement in platform development. Our GitHub repository hosts the evolution engine, community-contributed modules, and comprehensive development tools. This transparency and accessibility enable developers worldwide to contribute to the platform's growth, suggest improvements, and create custom integrations. The extensive documentation and SDK support make it easy for new developers to join our ecosystem and start contributing.
          </p>
        </div>
      )
    }
  ];

  const sidebar = (
    <div className="space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded text-left text-sm transition-colors ${
            activeSection === section.id
              ? 'bg-white/10 text-white'
              : 'hover:bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          {section.icon}
          {section.title}
        </button>
      ))}
    </div>
  );

  const activeContent = sections.find(section => section.id === activeSection);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seeds Documentation"
      sidebar={sidebar}
    >
      <div className="p-6 min-h-[400px]">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {activeContent?.icon && React.cloneElement(activeContent.icon as React.ReactElement, { className: 'w-6 h-6' })}
          {activeContent?.title}
        </h2>
        {activeContent?.content}
      </div>
    </Modal>
  );
}