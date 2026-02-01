/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Send,
  Image,
  Camera,
  MoreVertical,
  Phone,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Wrench,
  DollarSign,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRequest {
  id: string;
  customer: { name: string; avatar: string; id?: string | null };
  description: string;
  expectedPrice: number;
  status: "negotiating" | "agreed" | "completed";
}

const mockServiceRequest: ServiceRequest = {
  id: "1",
  customer: {
    name: "Оюунтөгс Б.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  description: "Гал тогооны цахилгааны утас солих, шинэ залгуур суурилуулах",
  expectedPrice: 180000,
  status: "negotiating",
};

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    chatId: "1",
    senderId: "user-1",
    senderRole: "user",
    content: "Сайн байна уу, гал тогооны цахилгааны асуудалтай байна",
    createdAt: new Date("2024-01-17T09:00:00"),
    read: true,
    messageType: "text",
  },
  {
    id: "2",
    chatId: "1",
    senderId: "user-1",
    senderRole: "user",
    content: "150,000₮ төлөх боломжтой",
    createdAt: new Date("2024-01-17T09:05:00"),
    read: true,
    messageType: "price_proposal",
    dealAmount: 150000,
  },
];

export default function WorkerChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showServiceHeader, setShowServiceHeader] = useState(true);
  const [chatStatus, setChatStatus] = useState<
    "negotiating" | "agreed" | "completed"
  >("negotiating");
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [pendingProposal, setPendingProposal] = useState<number | null>(null);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      // Try to load order (job)
      try {
        const { data: order } = (await supabase
          .from("orders")
          .select("*, user:profiles(id, name, avatar)")
          .eq("id", id)
          .maybeSingle()) as any;

        if (order) {
          setServiceRequest({
            id: order.id,
            customer: {
              id: order.user?.id ?? null,
              name: order.user?.name ?? null,
              avatar: order.user?.avatar ?? null,
            },
            description: order.description ?? "",
            expectedPrice: order.expected_price ?? 0,
            status: order.status ?? "negotiating",
          });
          setChatStatus(order.status ?? "negotiating");
          setPendingProposal(order.expected_price ?? null);
        } else if (
          location.state &&
          (location.state as any).serviceDescription
        ) {
          // Fallback to location state if navigation provided it
          const s = location.state as any;
          setServiceRequest({
            id: id as string,
            customer: { name: s.name ?? null, avatar: null },
            description: s.serviceDescription ?? "",
            expectedPrice: s.expectedPrice ?? 0,
            status: "negotiating",
          });
          setPendingProposal(s.expectedPrice ?? null);
        }

        // Find a chat linked to this order
        const { data: chatRow } = await supabase
          .from("chats")
          .select("*")
          .eq("order_id", id)
          .maybeSingle();

        if ((chatRow && chatRow?.data) ?? chatRow) {
          const row = (chatRow as any).data ?? chatRow;
          setChatId(row.id);
          // load messages
          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("chat_id", row.id)
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
        }
      } catch (err) {
        console.error("Failed to load worker chat detail:", err);
      }
    }

    load();
  }, [id, location.state]);

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

  const ensureChatExists = async () => {
    if (chatId) return chatId;
    if (!serviceRequest) return null;

    // create a chat row linking to the order
    try {
      const payload = {
        user_id: serviceRequest.customer.id ?? null,
        worker_id: profile?.id ?? null,
        order_id: serviceRequest.id,
        type: "service",
        status: "negotiating",
        last_message: null,
      } as any;

      const { data } = (await (supabase as any)
        .from("chats")
        .insert(payload)
        .select()
        .maybeSingle()) as any;

      if (data) {
        setChatId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
    return null;
  };

  const insertMessage = async (messagePayload: any) => {
    try {
      const idToUse = await ensureChatExists();
      if (!idToUse) return null;
      const payload = { ...messagePayload, chat_id: idToUse };
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

        // update chat last_message
        await (supabase as any)
          .from("chats")
          .update({ last_message: mapped.content } as any)
          .eq("id", idToUse);

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

    await insertMessage({
      sender_id: profile?.id ?? user?.id,
      sender_role: "worker",
      content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
      message_type: "deal_accepted",
      deal_amount: price,
    });

    // Optionally create or update order status as confirmed
    if (serviceRequest) {
      try {
        await (supabase as any)
          .from("orders")
          .update({ status: "confirmed", agreed_price: price } as any)
          .eq("id", serviceRequest.id);
      } catch (err) {
        console.error("Failed to update order status:", err);
      }
    }
  };

  const handleRejectPrice = async () => {
    setPendingProposal(null);
    await insertMessage({
      sender_id: profile?.id ?? user?.id,
      sender_role: "worker",
      content: "Уучлаарай, энэ үнэ тохирохгүй байна",
      message_type: "deal_rejected",
    });
  };

  const handleCounterOffer = async () => {
    const price = parseInt(counterPrice.replace(/,/g, ""));
    if (price <= 0) return;

    setPendingProposal(null);
    setShowCounterInput(false);
    setCounterPrice("");

    await insertMessage({
      sender_id: profile?.id ?? user?.id,
      sender_role: "worker",
      content: `${price?.toLocaleString()}₮ санал болгож байна`,
      message_type: "price_proposal",
      deal_amount: price,
    });
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
              {message.dealAmount}₮ тохиролцсон
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
          <img
            src={serviceRequest.customer.avatar}
            alt={serviceRequest.customer.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {serviceRequest.customer.name}
            </h1>
            <p
              className={`text-xs ${
                chatStatus === "agreed"
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}>
              {chatStatus === "agreed"
                ? "Тохиролцсон ✓"
                : "Үнэ тохиролцож байна"}
            </p>
          </div>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Service Header */}
        <motion.div
          initial={false}
          animate={{ height: showServiceHeader ? "auto" : 48 }}
          className="bg-card border-b border-border overflow-hidden">
          <button
            onClick={() => setShowServiceHeader(!showServiceHeader)}
            className="w-full px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Үйлчилгээний хүсэлт</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={chatStatus === "agreed" ? "default" : "secondary"}
                className={chatStatus === "agreed" ? "bg-green-500" : ""}>
                {agreedPrice
                  ? `${agreedPrice?.toLocaleString()}₮`
                  : `~${serviceRequest.expectedPrice?.toLocaleString()}₮`}
              </Badge>
              {showServiceHeader ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showServiceHeader && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 pb-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    {serviceRequest.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
          {pendingProposal && chatStatus === "negotiating" && (
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
                  <h3 className="font-bold text-lg">Ажил баталгаажлаа!</h3>
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
        </div>
      </div>
    </AppLayout>
  );
}
