"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { Send, RefreshCw, MessageCircle } from "lucide-react";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  swap_request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

interface ChatWindowProps {
  swapRequestId: string;
}

export default function ChatWindow({ swapRequestId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          swap_request_id,
          sender_id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("swap_request_id", swapRequestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to Realtime messages for this swap request
    const channel = supabase
      .channel(`swap_chat_${swapRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `swap_request_id=eq.${swapRequestId}`,
        },
        async (payload) => {
          // When a new message comes in, refetch to get profile details
          await fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [swapRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        swap_request_id: swapRequestId,
        sender_id: user.id,
        content: content,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-zinc-800 rounded-2xl bg-zinc-900/30 overflow-hidden backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
        <MessageCircle className="h-4.5 w-4.5 text-violet-500" />
        <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Negotiation Chat</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-xs">Loading negotiation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 p-6">
            <MessageCircle className="h-8 w-8 stroke-[1.5] text-zinc-600 mb-2" />
            <p className="text-xs font-medium">No messages yet. Send a message to start negotiating details.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  msg.profiles?.avatar_url ? (
                    <img
                      src={msg.profiles.avatar_url}
                      alt={msg.profiles.username}
                      className="h-7 w-7 rounded-full object-cover mt-0.5"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-400 mt-0.5">
                      U
                    </div>
                  )
                )}

                <div className="flex flex-col max-w-[70%]">
                  {!isMe && (
                    <span className="text-[10px] text-zinc-500 font-medium ml-1 mb-0.5">
                      @{msg.profiles?.username || "user"}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                      isMe
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : "bg-zinc-800 text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[8px] text-zinc-500 mt-1 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-zinc-800 bg-zinc-900/60 p-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
