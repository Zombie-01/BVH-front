import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, OrderItem } from "@/types";
import {
  mockChats,
  mockChatMessages,
  mockStores,
  mockServiceWorkers,
  mockOrders,
} from "@/data/mockData";
import { UserPriceInput } from "@/components/chat/UserPriceInput";
import { PriceProposalCard } from "@/components/chat/PriceProposalCard";
import { DealConfirmedCard } from "@/components/chat/DealConfirmedCard";
import { AppLayout } from "@/components/layout/AppLayout";

const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    (location.state as {
      type?: string;
      name?: string;
      items?: OrderItem[];
      expectedPrice?: number;
      storeId?: string;
      workerId?: string;
      serviceDescription?: string;
    }) || {};

  // Find existing chat or create new one
  const existingChat = mockChats.find((c) => c.id === id);
  const chatMessages = id ? mockChatMessages[id] || [] : [];

  const store = state.storeId
    ? mockStores.find((s) => s.id === state.storeId)
    : existingChat?.storeId
    ? mockStores.find((s) => s.id === existingChat.storeId)
    : null;
  const worker = state.workerId
    ? mockServiceWorkers.find((w) => w.id === state.workerId)
    : existingChat?.workerId
    ? mockServiceWorkers.find((w) => w.id === existingChat.workerId)
    : null;

  const chatName = state.name || store?.name || worker?.name || "Чат";
  const items = state.items || existingChat?.items || [];
  const expectedPrice = state.expectedPrice || existingChat?.expectedPrice || 0;
  const serviceDescription =
    state.serviceDescription || existingChat?.serviceDescription;

  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showProductHeader, setShowProductHeader] = useState(true);
  const [chatStatus, setChatStatus] = useState<
    "initial" | "negotiating" | "agreed" | "cancelled"
  >(
    existingChat?.status === "agreed"
      ? "agreed"
      : id?.startsWith("new")
      ? "initial"
      : "negotiating"
  );
  const [agreedPrice, setAgreedPrice] = useState<number | null>(
    existingChat?.agreedPrice || null
  );
  const [currentProposal, setCurrentProposal] = useState<{
    price: number;
    from: "user" | "store" | "worker";
  } | null>(null);
  const [showDealConfirmed, setShowDealConfirmed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showDealConfirmed]);

  const handleUserPriceProposal = (price: number) => {
    setChatStatus("negotiating");
    setCurrentProposal({ price, from: "user" });

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: "user-1",
      senderRole: "user",
      content: `${price.toLocaleString()}₮ санал болгож байна`,
      createdAt: new Date(),
      read: false,
      messageType: "price_proposal",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);

    // Simulate store/worker response
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.6) {
        // Accept
        handleDealAccepted(price);
      } else if (random > 0.3) {
        // Counter offer
        const counterPrice = Math.round(price * (1 + Math.random() * 0.1));
        setCurrentProposal({
          price: counterPrice,
          from: store ? "store" : "worker",
        });

        const counterMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chatId: id || "new-chat",
          senderId: store?.id || worker?.id || "owner-1",
          senderRole: store ? "store" : "worker",
          content: `${counterPrice.toLocaleString()}₮ санал болгож байна`,
          createdAt: new Date(),
          read: true,
          messageType: "price_proposal",
          dealAmount: counterPrice,
        };
        setMessages((prev) => [...prev, counterMessage]);
      } else {
        // Continue negotiation
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chatId: id || "new-chat",
          senderId: store?.id || worker?.id || "owner-1",
          senderRole: store ? "store" : "worker",
          content: "Үнийн саналыг хүлээн авлаа, хэлэлцье!",
          createdAt: new Date(),
          read: true,
          messageType: "text",
        };
        setMessages((prev) => [...prev, response]);
      }
    }, 1500);
  };

  const handleAcceptProposal = (price: number) => {
    handleDealAccepted(price);
  };

  const handleRejectProposal = () => {
    setCurrentProposal(null);
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: "user-1",
      senderRole: "user",
      content: "Өөр үнэ санал болгоно уу",
      createdAt: new Date(),
      read: false,
      messageType: "text",
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleCounterProposal = (price: number) => {
    setCurrentProposal({ price, from: "user" });
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: "user-1",
      senderRole: "user",
      content: `${price.toLocaleString()}₮ санал болгож байна`,
      createdAt: new Date(),
      read: false,
      messageType: "price_proposal",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);

    // Simulate response
    setTimeout(() => {
      if (Math.random() > 0.4) {
        handleDealAccepted(price);
      }
    }, 1500);
  };

  const handleDealAccepted = (price: number) => {
    setAgreedPrice(price);
    setChatStatus("agreed");
    setCurrentProposal(null);
    setShowDealConfirmed(true);

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: store?.id || worker?.id || "owner-1",
      senderRole: store ? "store" : "worker",
      content: `${price.toLocaleString()}₮-р тохиролцлоо ✓`,
      createdAt: new Date(),
      read: true,
      messageType: "deal_accepted",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: "user-1",
      senderRole: "user",
      content: newMessage.trim(),
      createdAt: new Date(),
      read: false,
      messageType: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        chatId: id || "new-chat",
        senderId: store?.id || worker?.id || "owner-1",
        senderRole: store ? "store" : "worker",
        content: getAutoResponse(newMessage),
        createdAt: new Date(),
        read: true,
        messageType: "text",
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const message: ChatMessage = {
          id: Date.now().toString(),
          chatId: id || "new-chat",
          senderId: "user-1",
          senderRole: "user",
          content: "Зураг илгээлээ",
          imageUrl: reader.result as string,
          createdAt: new Date(),
          read: false,
          messageType: "image",
        };
        setMessages((prev) => [...prev, message]);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAutoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("үнэ") || lowerMessage.includes("хэд")) {
      return "Нийт үнийг тохиролцоё!";
    }
    if (lowerMessage.includes("хүргэлт")) {
      return "Хүргэлт 10-15км хүртэл 15,000₮, түүнээс дээш 25,000₮ болно.";
    }
    if (lowerMessage.includes("баярлалаа")) {
      return "Зүгээр ээ, дахин холбогдоорой! 😊";
    }
    return "Ойлголоо, танд өөр юугаар туслах вэ?";
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMyMessage = (senderId: string) => senderId === "user-1";

  const renderMessage = (message: ChatMessage) => {
    const isMine = isMyMessage(message.senderId);

    if (message.messageType === "system") {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-full">
            <p className="text-sm text-muted-foreground">{message.content}</p>
          </div>
        </motion.div>
      );
    }

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
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{chatName}</h1>
            <p
              className={`text-xs ${
                chatStatus === "agreed"
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}>
              {chatStatus === "agreed"
                ? "Тохиролцсон ✓"
                : chatStatus === "negotiating"
                ? "Үнэ тохиролцож байна..."
                : "Чат эхэллээ"}
            </p>
          </div>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors">
            <Phone className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Sticky Product/Service Header */}
        {(items.length > 0 || serviceDescription) && (
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
                  {items.length > 0 ? `${items.length} бараа` : "Үйлчилгээ"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={chatStatus === "agreed" ? "default" : "secondary"}
                  className={chatStatus === "agreed" ? "bg-green-500" : ""}>
                  {agreedPrice
                    ? `${agreedPrice.toLocaleString()}₮`
                    : `~${expectedPrice.toLocaleString()}₮`}
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
                  {items.map((item, index) => (
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
                          {item.quantity} x {item.price.toLocaleString()}₮
                        </p>
                      </div>
                    </div>
                  ))}
                  {serviceDescription && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-foreground">
                        {serviceDescription}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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

          {/* Price Proposal Response UI */}
          {currentProposal &&
            currentProposal.from !== "user" &&
            chatStatus === "negotiating" && (
              <div className="my-4">
                <PriceProposalCard
                  proposedPrice={currentProposal.price}
                  currentPrice={expectedPrice}
                  senderRole={currentProposal.from}
                  viewerRole="user"
                  onAccept={handleAcceptProposal}
                  onReject={handleRejectProposal}
                  onCounter={handleCounterProposal}
                />
              </div>
            )}

          {/* Deal Confirmed Card */}
          {showDealConfirmed && agreedPrice && (
            <div className="my-4">
              <DealConfirmedCard
                agreedPrice={agreedPrice}
                storeName={store?.name || worker?.name}
                orderId={mockOrders[0]?.id}
                showContinueShopping={true}
                onContinueShopping={() => navigate("/stores")}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Price Input for User - Initial or during negotiation when no active proposal from other side */}
        {(chatStatus === "initial" ||
          (chatStatus === "negotiating" &&
            (!currentProposal || currentProposal.from === "user"))) &&
          expectedPrice > 0 &&
          !showDealConfirmed && (
            <div className="p-4 border-t border-border bg-card">
              <p className="text-sm text-muted-foreground mb-2">
                Санал болгох үнэ
              </p>
              <UserPriceInput
                suggestedPrice={expectedPrice}
                onSubmit={handleUserPriceProposal}
              />
            </div>
          )}

        {/* Regular Message Input */}
        {chatStatus !== "initial" && (
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
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 hover:bg-muted/80 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 hover:bg-muted/80 transition-colors">
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
        )}
      </div>
    </AppLayout>
  );
};

export default ChatDetail;
