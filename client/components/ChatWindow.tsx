import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import { chatApi } from "../api/chatApi";
import { Message, User } from "../types";

export const ChatWindow: React.FC = () => {
  const {
    activeConversationId,
    messages,
    conversations,
    upsertMessage,
    updateLastMessage,
  } = useChatStore();
  const { user: me } = useAuthStore();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];
  const partner = activeConv?.participants.find((p) => p.id !== me?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !me || isSending) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const newMessage: Message = await chatApi.sendMessage(
        activeConversationId,
        messageText,
      );
      upsertMessage(activeConversationId, { ...newMessage, status: "sent" });
      updateLastMessage(
        activeConversationId,
        newMessage.content,
        newMessage.timestamp,
      );
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!activeConversationId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Select a chat to start messaging
        </h2>
        <p className="text-slate-500 mt-2 max-w-xs">
          Private, secure, and blazing fast communications await you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#E7EBF3]">
      {/* Header */}
      <header className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src={partner?.avatar}
            alt={partner?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {partner?.username}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {partner?.status === "online" ? "online" : "last seen recently"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-blue-500 transition-colors">
            <svg
              className="w-5 h-5"
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
          </button>
          <button className="hover:text-blue-500 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {currentMessages.map((msg, idx) => {
          const isMe = msg.senderId === me?.id;
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl relative shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 rounded-bl-none"
                }`}
              >
                <p className="text-[15px] leading-relaxed break-words">
                  {msg.content}
                </p>
                <div
                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? "text-blue-100" : "text-slate-400"}`}
                >
                  <span>{time}</span>
                  {isMe && (
                    <span>
                      {msg.status === "read"
                        ? "✓✓"
                        : msg.status === "delivered"
                          ? "✓✓"
                          : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t border-slate-200">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-end gap-2"
        >
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Write a message..."
              className="w-full bg-slate-100 border-none rounded-2xl py-2 px-4 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none min-h-[40px] max-h-32 resize-none"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
              inputText.trim()
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-slate-100 text-slate-300"
            }`}
          >
            <svg
              className="w-6 h-6 rotate-90"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
