import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, sidebar }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-black border border-white/10 rounded-lg w-full max-w-6xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="hover:text-green-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex h-[600px]">
          {sidebar && (
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              {sidebar}
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}