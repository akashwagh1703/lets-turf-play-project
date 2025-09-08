import React, { createContext, useContext, useState, useEffect } from 'react';
import { playerAuth } from '../services/playerApi';

const PlayerAuthContext = createContext();

export const usePlayerAuth = () => {
  const context = useContext(PlayerAuthContext);
  if (!context) {
    throw new Error('usePlayerAuth must be used within PlayerAuthProvider');
  }
  return context;
};

export const PlayerAuthProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('playerToken');
    const playerData = localStorage.getItem('playerData');
    
    if (token && playerData) {
      setPlayer(JSON.parse(playerData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await playerAuth.login(credentials);
      const { player: playerData, token } = response.data.data;
      
      localStorage.setItem('playerToken', token);
      localStorage.setItem('playerData', JSON.stringify(playerData));
      setPlayer(playerData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await playerAuth.register(userData);
      const { player: playerData, token } = response.data.data;
      
      localStorage.setItem('playerToken', token);
      localStorage.setItem('playerData', JSON.stringify(playerData));
      setPlayer(playerData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors 
      };
    }
  };

  const logout = async () => {
    try {
      await playerAuth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('playerToken');
      localStorage.removeItem('playerData');
      setPlayer(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await playerAuth.updateProfile(profileData);
      const updatedPlayer = response.data.data;
      
      localStorage.setItem('playerData', JSON.stringify(updatedPlayer));
      setPlayer(updatedPlayer);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed',
        errors: error.response?.data?.errors 
      };
    }
  };

  const value = {
    player,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!player,
  };

  return (
    <PlayerAuthContext.Provider value={value}>
      {children}
    </PlayerAuthContext.Provider>
  );
};