
import React from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';
import { User, Conversation } from '../types';

export const Sidebar: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const { user: me, logout } = useAuthStore();

  const getPartner = (conv: Conversation): User => {
    return conv.participants.find(p => p.id !== me?.id) || conv.participants[0];
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="w-full md:w-80 h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={me?.avatar} 
            alt={me?.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm leading-tight">{me?.username}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          title="Logout"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const partner = getPartner(conv);
          const isActive = activeConversationId === conv.id;

          return (
            <div 
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-slate-50'}`}
            >
              <div className="relative flex-shrink-0">
                <img 
                  src={partner.avatar} 
                  alt={partner.username} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {partner.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold truncate text-slate-900">{partner.username}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatTime(conv.lastTimestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
