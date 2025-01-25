import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Modal } from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'forgot';
  setAuthModal: (state: { isOpen: boolean; mode: 'login' | 'register' | 'forgot' }) => void;
}

export function AuthModal({ isOpen, onClose, mode, setAuthModal }: AuthModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: emailOrUsername, // For registration, we need an email
          password,
          options: {
            data: {
              username
            }
          }
        });
        if (error) throw error;
        toast.success('Registration successful! You can now log in.');
        onClose();
      } else if (mode === 'login') {
        // First try to find user by username if it doesn't look like an email
        let email = emailOrUsername;
        if (!emailOrUsername.includes('@')) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', emailOrUsername.toLowerCase())
            .single();
          
          if (profiles) {
            email = profiles.email;
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success('Welcome back!');
        onClose();
      } else if (mode === 'forgot') {
        // For forgot password, we need to find the email if username was provided
        let email = emailOrUsername;
        if (!emailOrUsername.includes('@')) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', emailOrUsername.toLowerCase())
            .single();
          
          if (profiles) {
            email = profiles.email;
          }
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        toast.success('If an account exists, you will receive a reset link.');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'register' ? 'Create Account' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:outline-none focus:border-green-400"
              placeholder="Enter username"
            />
          </div>
        )}
        <div>
          <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-400 mb-1">
            {mode === 'register' ? 'Email' : 'Email or Username'}
          </label>
          <input
            type={mode === 'register' ? 'email' : 'text'}
            id="emailOrUsername"
            required
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:outline-none focus:border-green-400"
            placeholder={mode === 'register' ? 'Enter email' : 'Enter email or username'}
          />
        </div>
        {mode !== 'forgot' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:outline-none focus:border-green-400"
              placeholder="Enter password"
              minLength={6}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black px-4 py-2 rounded hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 
           mode === 'register' ? 'Create Account' :
           mode === 'login' ? 'Sign In' :
           'Reset Password'}
        </button>
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => setAuthModal({ isOpen: true, mode: 'forgot' }), 100);
            }}
            className="w-full text-sm text-gray-400 hover:text-white"
          >
            Forgot password?
          </button>
        )}
        {(mode === 'login' || mode === 'register') && (
          <p className="text-sm text-gray-400 text-center">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => setAuthModal({ 
                  isOpen: true, 
                  mode: mode === 'login' ? 'register' : 'login' 
                }), 100);
              }}
              className="text-white hover:text-green-400"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        )}
      </form>
    </Modal>
  );
}