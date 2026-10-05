import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  clearAllNotifications,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/dbService';
import { NotificationItem } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const items = await getUserNotifications(user.id);
      setNotifications(items);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000); // 30 sec sync
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    await markNotificationAsRead(id, user.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    if (!user) return;
    await clearAllNotifications(user.id);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
