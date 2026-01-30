import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
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
  Package,
  DollarSign,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, OrderItem } from "@/types";
import { AppLayout } from "@/components/layout/AppLayout";

interface ChatData {
  id: string;
  customer: { id?: string | null; name: string | null; avatar?: string | null };
  items: OrderItem[];
  expectedPrice?: number | null;
  status: "negotiating" | "agreed" | "completed";
}

export default function OwnerChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [chatDataState, setChatDataState] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Map convenience name
  const chatData = chatDataState;

  // upload helper for chat media
  const uploadToStorage = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("chat-media")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const urlRes = supabase.storage.from("chat-media").getPublicUrl(path);
    return urlRes.data?.publicUrl ?? null;
  };

  // load chat and messages, subscribe to new messages
  useEffect(() => {
    let channel: never | null = null;
    async function load() {
      if (!id) return;
      // load chat
      const { data: chatRow } = (await supabase
        .from("chats")
        .select("*")
        .eq("id", id)
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chats"]["Row"] | null;
        error: any;
      };
      if (chatRow) {
        const { data: profileRow } = (await supabase
          .from("profiles")
          .select("id, name, avatar")
          .eq("id", chatRow.user_id)
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["profiles"]["Row"] | null;
          error: any;
        };
        setChatDataState({
          id: chatRow.id,
          customer: {
            id: chatRow.user_id ?? null,
            name: profileRow?.name ?? null,
            avatar: profileRow?.avatar ?? null,
          },
          items: [],
          expectedPrice: chatRow.expected_price ?? null,
          status: chatRow.status as any,
        });
      }

      // load messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true });
      const mapped = (msgs ?? []).map(
        (m: any) =>
          ({
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
          }) as ChatMessage,
      );
      setMessages(mapped);

      // mark chat as read for owner (clear unread count)
      try {
        await (supabase as any)
          .from("chats")
          .update({
            unread_count: 0,
          } as Database["public"]["Tables"]["chats"]["Update"])
          .eq("id", id);
      } catch (e) {
        /* ignore */
      }

      // subscribe to new messages for this chat
      channel = supabase
        .channel(`chat-${id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `chat_id=eq.${id}`,
          },
          (payload: any) => {
            const m = payload.new;
            setMessages((prev) => [
              ...prev,
              {
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
              } as ChatMessage,
            ]);
          },
        )
        .subscribe();
    }

    load();
    return () => {
      if (channel) channel.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // chatData is loaded from DB into state above
  const [newMessage, setNewMessage] = useState("");
  const [showProductHeader, setShowProductHeader] = useState(true);
  const [chatStatus, setChatStatus] = useState<
    "negotiating" | "agreed" | "completed"
  >("negotiating");
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [pendingProposal, setPendingProposal] = useState<number | null>(null);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  useEffect(() => {
    if (!chatData) return;
    setChatStatus(chatData.status);
    setPendingProposal(chatData.expectedPrice ?? null);
  }, [chatData]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAcceptPrice = async (price: number) => {
    setAgreedPrice(price);
    setChatStatus("agreed");
    setPendingProposal(null);

    if (!id || !user) return;

    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? user.id,
        sender_role: "store",
        content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
        message_type: "deal_accepted",
        deal_amount: price,
      } as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data } = (await supabase
        .from("chat_messages")
        .insert(
          payload as Database["public"]["Tables"]["chat_messages"]["Insert"],
        )
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: any;
      };

      if (data) {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          } as any,
        ]);
        await (supabase as any)
          .from("chats")
          .update({
            last_message: payload.content,
            updated_at: new Date().toISOString(),
          } as Database["public"]["Tables"]["chats"]["Update"])
          .eq("id", id);
      }
    } catch (err) {
      console.error("Accept price failed:", err);
    }
  };

  const handleRejectPrice = async () => {
    setPendingProposal(null);

    if (!id || !user) return;
    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? user.id,
        sender_role: "store",
        content: "Уучлаарай, энэ үнэ тохирохгүй байна",
        message_type: "deal_rejected",
      } as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data } = (await supabase
        .from("chat_messages")
        .insert(
          payload as Database["public"]["Tables"]["chat_messages"]["Insert"],
        )
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: any;
      };
      if (data)
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          } as any,
        ]);
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

    if (!id || !user) return;
    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? user.id,
        sender_role: "store",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        message_type: "price_proposal",
        deal_amount: price,
      } as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data } = (await supabase
        .from("chat_messages")
        .insert(
          payload as Database["public"]["Tables"]["chat_messages"]["Insert"],
        )
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: any;
      };
      if (data)
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          } as any,
        ]);

      // quick simulated response (can be replaced by real user flow)
      setTimeout(async () => {
        if (Math.random() > 0.5) {
          await handleAcceptPrice(price);
        } else {
          const userCounter = Math.round(price * 0.95);
          setPendingProposal(userCounter);
          const counterPayload = {
            chat_id: id,
            sender_id: chatData?.customer.id ?? null,
            sender_role: "user",
            content: `${userCounter?.toLocaleString()}₮ санал болгож байна`,
            message_type: "price_proposal",
            deal_amount: userCounter,
          } as any;
          const res = await supabase
            .from("chat_messages")
            .insert(counterPayload)
            .select()
            .maybeSingle();
          if (res.data)
            setMessages((prev) => [
              ...prev,
              {
                ...res.data,
                createdAt: res.data.created_at
                  ? new Date(res.data.created_at)
                  : new Date(),
              } as any,
            ]);
        }
      }, 1500);
    } catch (err) {
      console.error("Counter offer failed:", err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !id || !user) return;

    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? user.id,
        sender_role: "store",
        content: newMessage.trim(),
        message_type: "text",
      } as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"];

      // insert message
      const { data } = (await supabase
        .from("chat_messages")
        .insert(
          payload as Database["public"]["Tables"]["chat_messages"]["Insert"],
        )
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: any;
      };
      if (data) {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          } as any,
        ]);
        // update chat last message
        await (supabase as any)
          .from("chats")
          .update({
            last_message: payload.content,
            updated_at: new Date().toISOString(),
          } as Database["public"]["Tables"]["chats"]["Update"])
          .eq("id", id);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;
    try {
      const publicUrl = await uploadToStorage(file, id);
      // insert message with image_url
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? user.id,
        sender_role: "store",
        content: "Зураг илгээлээ",
        image_url: publicUrl,
        message_type: "image",
      } as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data } = (await supabase
        .from("chat_messages")
        .insert(
          payload as Database["public"]["Tables"]["chat_messages"]["Insert"],
        )
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: any;
      };
      if (data)
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          } as any,
        ]);

      // update chat last message
      await supabase
        .from("chats")
        .update({
          last_message: payload.content,
          updated_at: new Date().toISOString(),
        } as Database["public"]["Tables"]["chats"]["Update"])
        .eq("id", id);
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

  const isMyMessage = (senderRole: string) => senderRole === "store";

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
            onClick={() => navigate("/owner/chats")}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <img
            src={chatData?.customer.avatar ?? ""}
            alt={chatData?.customer.name ?? ""}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {chatData?.customer.name ?? "-"}
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

        {/* Product Header */}
        <motion.div
          initial={false}
          animate={{ height: showProductHeader ? "auto" : 48 }}
          className="bg-card border-b border-border overflow-hidden">
          <button
            onClick={() => setShowProductHeader(!showProductHeader)}
            className="w-full px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">
                {chatData?.items?.length ?? 0} бараа
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={chatStatus === "agreed" ? "default" : "secondary"}
                className={chatStatus === "agreed" ? "bg-green-500" : ""}>
                {agreedPrice
                  ? `${agreedPrice?.toLocaleString()}₮`
                  : chatData?.expectedPrice
                    ? `~${chatData.expectedPrice?.toLocaleString()}₮`
                    : "—"}
              </Badge>
              {showProductHeader ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showProductHeader && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 pb-3 space-y-2">
                {chatData?.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-muted rounded-lg p-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {item.price?.toLocaleString()}₮
                      </p>
                    </div>
                  </div>
                ))}
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
                  <h3 className="font-bold text-lg">Захиалга баталгаажлаа!</h3>
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
