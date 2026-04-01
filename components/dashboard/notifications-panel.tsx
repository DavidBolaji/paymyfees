'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

function fmt(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function typeColor(type: string) {
  switch (type) {
    case 'SUCCESS': return 'bg-green-500';
    case 'ERROR': return 'bg-red-500';
    case 'WARNING': return 'bg-yellow-400';
    case 'REMINDER': return 'bg-orange-400';
    default: return 'bg-[#00296B]';
  }
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationsPanel({ isOpen, onClose, onUnreadCountChange }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get('/api/notifications').then(r => r.json());
      if (d.success) {
        const list: Notification[] = d.data ?? [];
        setNotifications(list);
        onUnreadCountChange?.(list.filter(n => !n.isRead).length);
      }
    } catch (e) {
      console.error('[NotificationsPanel] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {});
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        onUnreadCountChange?.(updated.filter(n => !n.isRead).length);
        return updated;
      });
    } catch (e) {
      console.error('[NotificationsPanel] mark read error', e);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/api/notifications/read-all', {});
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        onUnreadCountChange?.(0);
        return updated;
      });
    } catch (e) {
      console.error('[NotificationsPanel] mark all read error', e);
    } finally {
      setMarkingAll(false);
    }
  };

  if (!isOpen) return null;

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[360px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[200] flex flex-col max-h-[480px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00296B]" />
          <span className="font-bold text-[#191919] text-sm">Notifications</span>
          {unread > 0 && (
            <span className="bg-[#00296B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1 text-[11px] text-[#00296B] hover:underline disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 text-[#00296B] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id);
                if (n.actionUrl) window.location.href = n.actionUrl;
              }}
              className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
            >
              <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${typeColor(n.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-[#191919]' : 'text-gray-600'}`}>
                    {n.title}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0">{fmt(n.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              {!n.isRead && (
                <div className="shrink-0 self-center">
                  <Check className="w-3 h-3 text-[#00296B]" />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
