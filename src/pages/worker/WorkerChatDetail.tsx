import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Wrench,
  DollarSign,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/types";
import { AppLayout } from "@/components/layout/AppLayout";

interface ServiceRequest {
  id: string;
  customer: { name: string; avatar: string };
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

  const [serviceRequest] = useState<ServiceRequest>(mockServiceRequest);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showServiceHeader, setShowServiceHeader] = useState(true);
  const [chatStatus, setChatStatus] = useState<
    "negotiating" | "agreed" | "completed"
  >(serviceRequest.status);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [pendingProposal, setPendingProposal] = useState<number | null>(150000);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAcceptPrice = (price: number) => {
    setAgreedPrice(price);
    setChatStatus("agreed");
    setPendingProposal(null);

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "1",
      senderId: "worker-1",
      senderRole: "worker",
      content: `${price.toLocaleString()}₮-р зөвшөөрлөө ✓`,
      createdAt: new Date(),
      read: false,
      messageType: "deal_accepted",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleRejectPrice = () => {
    setPendingProposal(null);

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "1",
      senderId: "worker-1",
      senderRole: "worker",
      content: "Уучлаарай, энэ үнэ тохирохгүй байна",
      createdAt: new Date(),
      read: false,
      messageType: "deal_rejected",
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleCounterOffer = () => {
    const price = parseInt(counterPrice.replace(/,/g, ""));
    if (price <= 0) return;

    setPendingProposal(null);
    setShowCounterInput(false);
    setCounterPrice("");

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "1",
      senderId: "worker-1",
      senderRole: "worker",
      content: `${price.toLocaleString()}₮ санал болгож байна`,
      createdAt: new Date(),
      read: false,
      messageType: "price_proposal",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);

    // Simulate user response
    setTimeout(() => {
      if (Math.random() > 0.5) {
        handleAcceptPrice(price);
      } else {
        const userCounter = Math.round(price * 0.92);
        setPendingProposal(userCounter);
        const counterMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chatId: id || "1",
          senderId: "user-1",
          senderRole: "user",
          content: `${userCounter.toLocaleString()}₮ санал болгож байна`,
          createdAt: new Date(),
          read: true,
          messageType: "price_proposal",
          dealAmount: userCounter,
        };
        setMessages((prev) => [...prev, counterMessage]);
      }
    }, 1500);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "1",
      senderId: "worker-1",
      senderRole: "worker",
      content: newMessage.trim(),
      createdAt: new Date(),
      read: false,
      messageType: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const message: ChatMessage = {
          id: Date.now().toString(),
          chatId: id || "1",
          senderId: "worker-1",
          senderRole: "worker",
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
                  ? `${agreedPrice.toLocaleString()}₮`
                  : `~${serviceRequest.expectedPrice.toLocaleString()}₮`}
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
                {pendingProposal.toLocaleString()}₮
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
                    Тохирсон үнэ: {agreedPrice.toLocaleString()}₮
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
