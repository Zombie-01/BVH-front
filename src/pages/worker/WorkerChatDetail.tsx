/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Send,
  Image,
  Camera,
  MoreVertical,
  Phone,
  DollarSign,
  Check,
  X,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WorkerChatData {
  id: string;
  customer: { id?: string | null; name: string | null; avatar?: string | null };
  expectedPrice?: number | null;
  status: "negotiating" | "agreed" | "cancelled" | "completed";
  workerId?: string | null;
  type?: "store" | "service" | "driver";
  serviceDescription?: string | null;
  orderId?: string | null;
}

export default function WorkerChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatName, setChatName] = useState("Чат");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // chat metadata (for negotiation, linking to job/order, etc.)
  const [chatDataState, setChatDataState] = useState<WorkerChatData | null>(null);
  const chatData = chatDataState;

  // keep negotiation state in sync when metadata changes
  useEffect(() => {
    if (!chatData) return;
    setChatStatus(chatData.status as any);
    setPendingProposal(chatData.expectedPrice ?? null);
  }, [chatData]);

  // Negotiation state
  const [chatStatus, setChatStatus] = useState<"negotiating" | "agreed" | "completed" | "cancelled">("negotiating");
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [pendingProposal, setPendingProposal] = useState<number | null>(null);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        // Load chat by ID
        const { data: chatRow } = (await supabase
          .from("chats")
          .select("*")
          .eq("id", id)
          .maybeSingle()) as any;

        if (chatRow) {
          setChatId(chatRow.id);

          // populate chatDataState for later decision logic
          setChatDataState({
            id: chatRow.id,
            customer: {
              id: chatRow.user_id ?? null,
              name: null,
              avatar: null,
            },
            expectedPrice: chatRow.expected_price ?? null,
            status: (chatRow.status as any) ?? "negotiating",
            workerId: chatRow.worker_id ?? null,
            type: chatRow.type ?? undefined,
            serviceDescription: chatRow.service_description ?? null,
            orderId: chatRow.order_id ?? null,
          });

          // set negotiation state from row
          setChatStatus((chatRow.status as any) ?? "negotiating");
          setPendingProposal(chatRow.expected_price ?? null);
          setAgreedPrice(chatRow.agreed_price ?? null);

          // Fetch customer profile to set chat name & update chatDataState
          if (chatRow.user_id) {
            const { data: profileData } = (await supabase
              .from("profiles")
              .select("id, name, avatar")
              .eq("id", chatRow.user_id)
              .maybeSingle()) as any;
            setChatName(profileData?.name ?? "Үзүүлэлтээр");
            setChatDataState((prev) =>
              prev
                ? {
                    ...prev,
                    customer: {
                      id: profileData?.id ?? null,
                      name: profileData?.name ?? null,
                      avatar: profileData?.avatar ?? null,
                    },
                  }
                : prev,
            );
          }

          // Load messages
          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("chat_id", chatRow.id)
            .order("created_at", { ascending: true });

          const mapped = (msgs ?? []).map((m: any) => ({
            id: m.id,
            chatId: m.chat_id,
            senderId: m.sender_id,
            senderRole: m.sender_role,
            content: m.content ?? "",
            imageUrl: m.image_url ?? undefined,
            createdAt: m.created_at ? new Date(m.created_at) : new Date(),
            read: !!m.read,
            messageType: m.message_type as any,
            dealAmount: m.deal_amount ?? undefined,
          })) as ChatMessage[];
          setMessages(mapped);

          // Mark chat as read (clear unread count)
          try {
            await (supabase as any)
              .from("chats")
              .update({ unread_count: 0 })
              .eq("id", chatRow.id);
          } catch (e) {
            /* ignore */
          }
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // realtime subscription for incoming messages (deduped)
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    if (!chatId) return;

    channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          const m = payload.new;
          const mapped: ChatMessage = {
            id: m.id,
            chatId: m.chat_id,
            senderId: m.sender_id,
            senderRole: m.sender_role,
            content: m.content ?? "",
            imageUrl: m.image_url ?? undefined,
            createdAt: m.created_at ? new Date(m.created_at) : new Date(),
            read: !!m.read,
            messageType: m.message_type as any,
            dealAmount: m.deal_amount ?? undefined,
          };
          setMessages((prev) =>
            prev.some((x) => x.id === mapped.id) ? prev : [...prev, mapped],
          );
        },
      )
      .subscribe();

    return () => {
      if (channel) channel.unsubscribe?.();
    };
  }, [chatId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const insertMessage = async (messagePayload: any) => {
    try {
      if (!chatId) return null;

      const payload = { ...messagePayload, chat_id: chatId };
      const { data } = (await (supabase as any)
        .from("chat_messages")
        .insert(payload as any)
        .select()
        .maybeSingle()) as any;

      if (data) {
        const mapped: ChatMessage = {
          id: data.id,
          chatId: data.chat_id,
          senderId: data.sender_id,
          senderRole: data.sender_role,
          content: data.content ?? "",
          imageUrl: data.image_url ?? undefined,
          createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          read: !!data.read,
          messageType: data.message_type as any,
          dealAmount: data.deal_amount ?? undefined,
        };

        setMessages((prev) =>
          prev.some((x) => x.id === mapped.id) ? prev : [...prev, mapped],
        );

        // Update chat last_message
        await (supabase as any)
          .from("chats")
          .update({ last_message: mapped.content } as any)
          .eq("id", chatId);

        return mapped;
      }
    } catch (err) {
      console.error("Insert message failed:", err);
    }
    return null;
  };

  const handleAcceptPrice = async (price: number) => {
    setAgreedPrice(price);
    setChatStatus("agreed");
    setPendingProposal(null);

    if (!chatId || !user) return;

    try {
      const payload = {
        sender_id: profile?.id ?? user?.id,
        sender_role: "worker",
        content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
        message_type: "deal_accepted",
        deal_amount: price,
      };

      await insertMessage(payload);

      // Update chat status
      await (supabase as any)
        .from("chats")
        .update({
          last_message: payload.content,
          updated_at: new Date().toISOString(),
          status: "agreed",
          agreed_price: price,
        } as any)
        .eq("id", chatId);

      // create an order if none exists for this chat (same as owner flow)
      try {
        if (chatData?.orderId) return; // already has order
        const orderPayload = {
          user_id: chatData?.customer.id ?? null,
          store_id: null,
          worker_id: profile?.id ?? user?.id,
          chat_id: chatId,
          type: chatData?.type === "service" ? "service" : "delivery",
          status: "confirmed",
          expected_price: chatData?.expectedPrice ?? price,
          agreed_price: price,
          total_amount: price,
          service_description: chatData?.serviceDescription ?? null,
        } as any;

        const { data: orderData } = (await supabase
          .from("orders")
          .insert(orderPayload)
          .select()
          .maybeSingle()) as any;

        if (orderData) {
          await (supabase as any)
            .from("chats")
            .update({ order_id: orderData.id, updated_at: new Date().toISOString() } as any)
            .eq("id", chatId);
          setChatDataState((prev) =>
            prev ? { ...prev, orderId: orderData.id } : prev,
          );
        }
      } catch (err) {
        console.error("Failed to create order after agreement:", err);
      }
    } catch (err) {
      console.error("Accept price failed:", err);
    }
  };

  const handleRejectPrice = async () => {
    setPendingProposal(null);

    if (!chatId || !user) return;
    try {
      const payload = {
        sender_id: profile?.id ?? user?.id,
        sender_role: "worker",
        content: "Уучлаарай, энэ үнэ тохирохгүй байна",
        message_type: "deal_rejected",
      };

      await insertMessage(payload);
    } catch (err) {
      console.error("Reject price failed:", err);
    }
  };

  const handleCounterOffer = async () => {
    const price = parseInt(counterPrice.replace(/,/g, ""));
    if (price <= 0) return;

    setPendingProposal(null);
    setShowCounterInput(false);
    setCounterPrice("");

    if (!chatId || !user) return;
    try {
      const payload = {
        sender_id: profile?.id ?? user?.id,
        sender_role: "worker",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        message_type: "price_proposal",
        deal_amount: price,
      };

      await insertMessage(payload);
    } catch (err) {
      console.error("Counter offer failed:", err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await insertMessage({
      sender_id: profile?.id ?? user?.id,
      sender_role: "worker",
      content: newMessage.trim(),
      message_type: "text",
    });
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow re-selecting same file later
    e.currentTarget.value = "";
    if (!file) return;

    // upload to chat-images bucket (public url preferred, signed-url fallback)
    const path = `${chatId ?? "unknown"}/${Date.now()}_${file.name}`;
    try {
      const { error } = await supabase.storage
        .from("chat-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const urlRes = supabase.storage.from("chat-images").getPublicUrl(path);
      let publicUrl = urlRes.data?.publicUrl ?? null;
      if (!publicUrl) {
        const signed = await supabase.storage
          .from("chat-images")
          .createSignedUrl(path, 60 * 60);
        publicUrl = signed.data?.signedUrl ?? null;
      }

      await insertMessage({
        sender_id: profile?.id ?? user?.id,
        sender_role: "worker",
        content: "Зураг илгээлээ",
        image_url: publicUrl,
        message_type: "image",
      });
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMyMessage = (senderRole: string) => senderRole === "worker";

  if (!chatId && !loading) {
    return (
      <AppLayout hideNav>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Чат олдсонгүй</p>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout hideNav>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ачаалж байна...</p>
        </div>
      </AppLayout>
    );
  }

  const renderMessage = (message: ChatMessage) => {
    const isMine = isMyMessage(message.senderRole);

    if (message.messageType === "deal_accepted") {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center my-4">
          <div className="bg-green-500/10 border border-green-500 px-4 py-2 rounded-full">
            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {message.dealAmount?.toLocaleString()}₮ тохиролцсон
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
            isMine
              ? message.messageType === "price_proposal"
                ? "bg-primary/20 border-2 border-primary rounded-br-md"
                : "bg-primary text-primary-foreground rounded-br-md"
              : message.messageType === "price_proposal"
                ? "bg-card border-2 border-primary rounded-bl-md"
                : "bg-card border border-border rounded-bl-md"
          }`}>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Attachment"
              className="rounded-lg mb-2 max-w-full"
            />
          )}
          <p
            className={
              isMine && message.messageType !== "price_proposal"
                ? "text-primary-foreground"
                : "text-foreground"
            }>
            {message.content}
          </p>
          <p
            className={`text-xs mt-1 ${
              isMine && message.messageType !== "price_proposal"
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            }`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <AppLayout hideNav>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full lg:my-6 lg:rounded-2xl lg:border lg:border-border lg:overflow-hidden lg:shadow-lg bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 safe-area-top">
          <button
            onClick={() => navigate("/worker/jobs")}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {chatData?.customer.avatar && (
            <img
              src={chatData.customer.avatar}
              alt={chatData.customer.name ?? ""}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{chatName}</h1>
            {chatStatus === "agreed" && (
              <p className="text-xs text-green-500">Тохиролцсон ✓</p>
            )}
          </div>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Service Header */}
        {chatData?.serviceDescription && (
          <div className="bg-card border-b border-border px-4 py-2">
            <p className="text-sm text-foreground">
              {chatData.serviceDescription}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
          {messages.map((message, index) => {
            const showDate =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="text-center py-2">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {new Date(message.createdAt).toLocaleDateString("mn-MN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {renderMessage(message)}
              </React.Fragment>
            );
          })}

          {/* Price Proposal Action Card */}
          {pendingProposal &&
            chatStatus === "negotiating" &&
            !chatData?.orderId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border-2 border-primary rounded-2xl p-4 my-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Хэрэглэгчийн үнийн санал
                  </span>
                </div>

                <p className="text-2xl font-bold text-primary mb-4">
                  {pendingProposal?.toLocaleString()}₮
                </p>

                {!showCounterInput ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAcceptPrice(pendingProposal)}>
                      <Check className="w-4 h-4 mr-2" />
                      Зөвшөөрөх
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCounterInput(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Өөрчлөх
                    </Button>
                    <Button variant="ghost" onClick={handleRejectPrice}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={counterPrice}
                        onChange={(e) =>
                          setCounterPrice(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder="Шинэ үнэ оруулах"
                        className="flex-1"
                      />
                      <span className="flex items-center text-muted-foreground">
                        ₮
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleCounterOffer}>
                        <Send className="w-4 h-4 mr-2" />
                        Санал илгээх
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCounterInput(false)}>
                        Болих
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          {/* Deal Confirmed */}
          {chatStatus === "agreed" && agreedPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white my-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Үйлчилгээ баталгаажлаа!</h3>
                  <p className="text-white/80">
                    Тохирсон үнэ: {agreedPrice?.toLocaleString()}₮
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-card border-t border-border p-4 safe-area-bottom">
          {chatData?.orderId ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-foreground">
                Үйлчилгээний ажил <span className="font-medium">#{chatData.orderId}</span> үүссэн тул чат хаагдсан.
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate("/worker/jobs")}>Ажлыг харах</Button>
              </div>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 text-muted-foreground" />
                </button>
                <Input
                  placeholder="Мессеж бичих..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="flex-shrink-0">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
