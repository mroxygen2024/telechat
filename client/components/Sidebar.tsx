import React, { useEffect, useState } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import { User, Conversation } from "../types";
import { chatApi } from "../api/chatApi";

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    addConversation,
  } = useChatStore();
  const { user: me, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [modalError, setModalError] = useState("");

  const getPartner = (conv: Conversation): User => {
    return (
      conv.participants.find((p) => p.id !== me?.id) || conv.participants[0]
    );
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitial = (name?: string) =>
    name?.trim().charAt(0).toUpperCase() || "?";

  const renderAvatar = (
    user?: User,
    className = "w-10 h-10",
    textClass = "text-sm",
  ) => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.username}
          className={`${className} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${className} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold ${textClass}`}
        aria-label={user?.username}
      >
        {getInitial(user?.username)}
      </div>
    );
  };

  const openNewChat = async () => {
    setIsModalOpen(true);
    setModalError("");
    setSearch("");
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const timeoutId = window.setTimeout(async () => {
      setIsLoadingUsers(true);
      setModalError("");
      try {
        const result = await chatApi.getUsers(search.trim() || undefined);
        setUsers(result);
      } catch (error: any) {
        setModalError(error.message || "Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [isModalOpen, search]);

  const startConversation = async (participantId: string) => {
    if (!me?.id) return;
    setModalError("");
    try {
      const conversation = await chatApi.createConversation(
        participantId,
        me.id,
      );
      addConversation(conversation);
      setActiveConversation(conversation.id);
      setIsModalOpen(false);
    } catch (error: any) {
      setModalError(error.message || "Failed to create conversation");
    }
  };

  return (
    <aside className="w-full md:w-80 h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {renderAvatar(me, "w-10 h-10", "text-sm")}
          <div>
            <p className="font-semibold text-sm leading-tight">
              {me?.username}
            </p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          title="Logout"
        >
          <svg
            className="w-5 h-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
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
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={openNewChat}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
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
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${isActive ? "bg-blue-50 border-r-4 border-blue-500" : "hover:bg-slate-50"}`}
            >
              <div className="relative flex-shrink-0">
                {renderAvatar(partner, "w-12 h-12", "text-base")}
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                    partner.status === "online"
                      ? "bg-green-500"
                      : "bg-slate-300"
                  }`}
                  title={
                    partner.status === "online"
                      ? "Online"
                      : "last seen recently"
                  }
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold truncate text-slate-900">
                    {partner.username}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatTime(conv.lastTimestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.lastMessage || "No messages yet"}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Start new chat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {modalError && (
              <p className="text-xs text-red-500 mb-2">{modalError}</p>
            )}

            <div className="max-h-64 overflow-y-auto">
              {isLoadingUsers ? (
                <p className="text-sm text-slate-500">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-slate-500">No users found</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(user, "w-8 h-8", "text-xs")}
                      <span className="text-sm text-slate-800">
                        {user.username}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Start chat</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
