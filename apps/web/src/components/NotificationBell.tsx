"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch unread count
    const { data: unreadData } = useQuery({
        queryKey: ['notifications-unread'],
        queryFn: async () => {
            const res = await fetch('/api/notifications/unread-count');
            return res.json();
        },
        refetchInterval: 30000 // Poll every 30s
    });

    // Fetch notifications list (only when open)
    const { data: notifications, refetch: refetchList } = useQuery({
        queryKey: ['notifications-list'],
        queryFn: async () => {
            const res = await fetch('/api/notifications');
            return res.json();
        },
        enabled: isOpen
    });

    // Mark read mutation
    const markReadMutation = useMutation({
        mutationFn: async ({ id, markAllRead }) => {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, markAllRead })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications-unread']);
            queryClient.invalidateQueries(['notifications-list']);
        }
    });

    const unreadCount = unreadData?.count || 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-900">Notificaties</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markReadMutation.mutate({ markAllRead: true })}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Alles gelezen
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {!notifications || notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Geen notificaties.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => {
                                            if (!notif.is_read) markReadMutation.mutate({ id: notif.id });
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <StatusIcon type={notif.type} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(notif.created_at).toLocaleString('nl-NL', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="flex-shrink-0 self-center">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusIcon({ type }) {
    if (type === 'success') return <CheckCircle size={18} className="text-green-500" />;
    if (type === 'warning') return <AlertTriangle size={18} className="text-orange-500" />;
    if (type === 'error') return <XCircle size={18} className="text-red-500" />;
    return <Info size={18} className="text-blue-500" />;
}
