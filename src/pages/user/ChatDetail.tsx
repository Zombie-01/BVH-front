/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import type { Store, ServiceWorker, Order } from "@/types";
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

  // Find existing chat or create new one (DB-backed). state covers new-chat flows.
  const { user, profile } = useAuth();
  const [existingChat, setExistingChat] = useState<
    Database["public"]["Tables"]["chats"]["Row"] | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [worker, setWorker] = useState<ServiceWorker | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);

      // new chat (client-only) - prefilled from location.state
      if (id.startsWith("new-")) {
        const storeId = id.replace("new-", "");
        if (storeId) {
          const { data: storeRow } = (await supabase
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .maybeSingle()) as {
            data: Database["public"]["Tables"]["stores"]["Row"] | null;
            error: unknown;
          };
          if (storeRow && mounted) {
            setStore({
              id: storeRow.id,
              name: storeRow.name,
              description: storeRow.description ?? "",
              image: storeRow.image ?? "",
              rating: storeRow.rating ?? 0,
              reviewCount: storeRow.review_count ?? 0,
              category:
                (storeRow.categories && storeRow.categories[0]) || "other",
              location: storeRow.location ?? "",
              isOpen: storeRow.is_open,
              phone: storeRow.phone ?? undefined,
            });
          }
          setMessages([]);
          setLoading(false);
          return;
        }
      }

      // existing chat - load from DB
      const { data: chatRow } = (await supabase
        .from("chats")
        .select("*")
        .eq("id", id)
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chats"]["Row"] | null;
        error: unknown;
      };

      if (chatRow && mounted) {
        setExistingChat(chatRow);
        if (chatRow.store_id) {
          const { data: storeRow } = (await supabase
            .from("stores")
            .select("*")
            .eq("id", chatRow.store_id)
            .maybeSingle()) as {
            data: Database["public"]["Tables"]["stores"]["Row"] | null;
            error: unknown;
          };
          if (storeRow) {
            setStore({
              id: storeRow.id,
              name: storeRow.name,
              description: storeRow.description ?? "",
              image: storeRow.image ?? "",
              rating: storeRow.rating ?? 0,
              reviewCount: storeRow.review_count ?? 0,
              category:
                (storeRow.categories && storeRow.categories[0]) || "other",
              location: storeRow.location ?? "",
              isOpen: storeRow.is_open,
              phone: storeRow.phone ?? undefined,
            });
          }
        }

        if (chatRow.worker_id) {
          const { data: workerRow } = (await supabase
            .from("service_workers")
            .select("*")
            .eq("id", chatRow.worker_id)
            .maybeSingle()) as {
            data: Database["public"]["Tables"]["service_workers"]["Row"] | null;
            error: unknown;
          };
          if (workerRow) {
            setWorker({
              id: workerRow.id,
              name: "",
              avatar: "",
              specialty: workerRow.specialty,
              rating: workerRow.rating ?? 0,
              completedJobs: workerRow.completed_jobs ?? 0,
              badges: workerRow.badges ?? [],
              hourlyRate: workerRow.hourly_rate ?? 0,
              isAvailable: workerRow.is_available,
            });
          }
        }

        // fetch messages
        const { data: msgs } = (await supabase
          .from("chat_messages")
          .select("*")
          .eq("chat_id", id)
          .order("created_at", { ascending: true })) as {
          data: Database["public"]["Tables"]["chat_messages"]["Row"][] | null;
          error: unknown;
        };

        if (msgs && mounted) {
          const mapped = msgs.map((m) => ({
            id: m.id,
            chatId: m.chat_id,
            senderId: m.sender_id,
            senderRole: m.sender_role,
            content: m.content ?? "",
            imageUrl: m.image_url ?? undefined,
            createdAt: m.created_at ? new Date(m.created_at) : new Date(),
            read: !!m.read,
            messageType: m.message_type as ChatMessage["messageType"],
            dealAmount: m.deal_amount ?? undefined,
          }));
          setMessages(mapped as ChatMessage[]);
        }
      }

      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Derived values for UI
  const chatName = state.name || store?.name || worker?.name || "Чат";
  const items = state.items ?? [];
  const expectedPrice =
    state.expectedPrice ?? existingChat?.expected_price ?? 0;
  const serviceDescription =
    state.serviceDescription ?? existingChat?.service_description;

  const [newMessage, setNewMessage] = useState("");
  const [showProductHeader, setShowProductHeader] = useState(true);
  const [chatStatus, setChatStatus] = useState<
    "initial" | "negotiating" | "agreed" | "cancelled"
  >(
    existingChat?.status === "agreed"
      ? "agreed"
      : id?.startsWith("new")
        ? "initial"
        : "negotiating",
  );
  const [agreedPrice, setAgreedPrice] = useState<number | null>(
    existingChat?.agreed_price ?? null,
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

  const handleUserPriceProposal = async (price: number) => {
    setChatStatus("negotiating");
    setCurrentProposal({ price, from: "user" });

    // New-chat: create DB chat and send proposal, then auto-accept
    if (!id || id.startsWith("new-")) {
      const chatInit = {
        user_id: profile?.id ?? "",
        store_id: state.storeId ?? store?.id ?? null,
        worker_id: state.workerId ?? worker?.id ?? null,
        type: state.storeId || store?.id ? "store" : "service",
        status: "negotiating",
        expected_price: price,
        last_message: `${price?.toLocaleString()}₮ санал болгож байна`,
      } as Partial<Database["public"]["Tables"]["chats"]["Insert"]>;

      const messageInit = {
        sender_id: profile?.id ?? "",
        sender_role: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        message_type: "price_proposal",
        deal_amount: price,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const res = await createChatAndSend(chatInit, messageInit);
      if (res?.message && res.chat) {
        const m = res.message;
        const mapped = {
          id: m.id,
          chatId: m.chat_id,
          senderId: m.sender_id,
          senderRole: m.sender_role,
          content: m.content ?? "",
          imageUrl: m.image_url ?? undefined,
          createdAt: m.created_at ? new Date(m.created_at) : new Date(),
          read: !!m.read,
          messageType: m.message_type as ChatMessage["messageType"],
          dealAmount: m.deal_amount ?? undefined,
        } as ChatMessage;
        setExistingChat(res.chat);
        setMessages((prev) => [...prev, mapped]);

        // Auto-accept proposal on behalf of store/worker
        const senderId = res.chat.store_id ?? res.chat.worker_id ?? "system";
        const senderRole = res.chat.store_id
          ? "store"
          : res.chat.worker_id
            ? "worker"
            : "system";
        const accPayload = {
          chat_id: res.chat.id,
          sender_id: senderId as string,
          sender_role: senderRole,
          content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
          message_type: "deal_accepted",
          deal_amount: price,
        } as Database["public"]["Tables"]["chat_messages"]["Insert"];

        const { data: acc } = (await (supabase as any)
          .from("chat_messages")
          .insert(accPayload)
          .select()
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
          error: unknown;
        };

        if (acc) {
          const mappedAcc = {
            id: acc.id,
            chatId: acc.chat_id,
            senderId: acc.sender_id,
            senderRole: acc.sender_role,
            content: acc.content ?? "",
            imageUrl: acc.image_url ?? undefined,
            createdAt: acc.created_at ? new Date(acc.created_at) : new Date(),
            read: !!acc.read,
            messageType: acc.message_type as ChatMessage["messageType"],
            dealAmount: acc.deal_amount ?? undefined,
          } as ChatMessage;

          // update chat row
          await (supabase as any)
            .from("chats")
            .update({
              status: "agreed",
              agreed_price: price,
              last_message: acc.content,
            })
            .eq("id", res.chat.id);

          setMessages((prev) => [...prev, mappedAcc]);
          setChatStatus("agreed");
          setAgreedPrice(price);
          setCurrentProposal(null);
          setShowDealConfirmed(true);
        }
      }

      return;
    }

    // DB-backed flow for existing chats
    try {
      const userPayload = {
        chat_id: id,
        sender_id: profile?.id ?? "",
        sender_role: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        message_type: "price_proposal",
        deal_amount: price,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data: userMsg } = (await (supabase as any)
        .from("chat_messages")
        .insert(userPayload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      if (userMsg) {
        const mapped = {
          id: userMsg.id,
          chatId: userMsg.chat_id,
          senderId: userMsg.sender_id,
          senderRole: userMsg.sender_role,
          content: userMsg.content ?? "",
          imageUrl: userMsg.image_url ?? undefined,
          createdAt: userMsg.created_at
            ? new Date(userMsg.created_at)
            : new Date(),
          read: !!userMsg.read,
          messageType: userMsg.message_type as ChatMessage["messageType"],
          dealAmount: userMsg.deal_amount ?? undefined,
        } as ChatMessage;
        setMessages((prev) => [...prev, mapped]);
      }

      // Auto-accept all proposals: insert a deal_accepted message from store/worker
      const senderId =
        existingChat?.store_id ?? existingChat?.worker_id ?? "system";
      const senderRole = existingChat?.store_id
        ? "store"
        : existingChat?.worker_id
          ? "worker"
          : "system";
      const acceptPayload = {
        chat_id: id,
        sender_id: senderId as string,
        sender_role: senderRole,
        content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
        message_type: "deal_accepted",
        deal_amount: price,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data: accMsg } = (await (supabase as any)
        .from("chat_messages")
        .insert(acceptPayload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      if (accMsg) {
        const mapped = {
          id: accMsg.id,
          chatId: accMsg.chat_id,
          senderId: accMsg.sender_id,
          senderRole: accMsg.sender_role,
          content: accMsg.content ?? "",
          imageUrl: accMsg.image_url ?? undefined,
          createdAt: accMsg.created_at
            ? new Date(accMsg.created_at)
            : new Date(),
          read: !!accMsg.read,
          messageType: accMsg.message_type as ChatMessage["messageType"],
          dealAmount: accMsg.deal_amount ?? undefined,
        } as ChatMessage;

        // update chat row (status/agreed_price/last_message)
        await (supabase as any)
          .from("chats")
          .update({
            status: "agreed",
            agreed_price: price,
            last_message: mapped.content,
          })
          .eq("id", id);

        setMessages((prev) => [...prev, mapped]);
        setChatStatus("agreed");
        setAgreedPrice(price);
        setCurrentProposal(null);
        setShowDealConfirmed(true);
      }
    } catch (err) {
      // fallback: append locally
      const message: ChatMessage = {
        id: Date.now().toString(),
        chatId: id || "new-chat",
        senderId: profile?.id ?? "user-1",
        senderRole: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        createdAt: new Date(),
        read: false,
        messageType: "price_proposal",
        dealAmount: price,
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleAcceptProposal = async (price: number) => {
    await handleDealAccepted(price);
  };

  const handleRejectProposal = async () => {
    setCurrentProposal(null);

    if (!id || id.startsWith("new-")) {
      const chatInit = {
        user_id: profile?.id ?? "",
        store_id: state.storeId ?? store?.id ?? null,
        worker_id: state.workerId ?? worker?.id ?? null,
        type: state.storeId || store?.id ? "store" : "service",
        status: "negotiating",
        last_message: "Өөр үнэ санал болгоно уу",
      } as Partial<Database["public"]["Tables"]["chats"]["Insert"]>;

      const messageInit = {
        sender_id: profile?.id ?? "",
        sender_role: "user",
        content: "Өөр үнэ санал болгоно уу",
        message_type: "text",
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const res = await createChatAndSend(chatInit, messageInit);
      if (res?.message && res.chat) {
        const m = res.message;
        const mapped = {
          id: m.id,
          chatId: m.chat_id,
          senderId: m.sender_id,
          senderRole: m.sender_role,
          content: m.content ?? "",
          imageUrl: m.image_url ?? undefined,
          createdAt: m.created_at ? new Date(m.created_at) : new Date(),
          read: !!m.read,
          messageType: m.message_type as ChatMessage["messageType"],
          dealAmount: m.deal_amount ?? undefined,
        } as ChatMessage;
        setExistingChat(res.chat);
        setMessages((prev) => [...prev, mapped]);
      }

      return;
    }

    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? "",
        sender_role: "user",
        content: "Өөр үнэ санал болгоно уу",
        message_type: "text",
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data: inserted } = (await (supabase as any)
        .from("chat_messages")
        .insert(payload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      if (inserted) {
        const mapped = {
          id: inserted.id,
          chatId: inserted.chat_id,
          senderId: inserted.sender_id,
          senderRole: inserted.sender_role,
          content: inserted.content ?? "",
          imageUrl: inserted.image_url ?? undefined,
          createdAt: inserted.created_at
            ? new Date(inserted.created_at)
            : new Date(),
          read: !!inserted.read,
          messageType: inserted.message_type as ChatMessage["messageType"],
          dealAmount: inserted.deal_amount ?? undefined,
        } as ChatMessage;
        setMessages((prev) => [...prev, mapped]);
      }
    } catch (err) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chatId: id || "new-chat",
        senderId: profile?.id ?? "user-1",
        senderRole: "user",
        content: "Өөр үнэ санал болгоно уу",
        createdAt: new Date(),
        read: false,
        messageType: "text",
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleCounterProposal = async (price: number) => {
    setCurrentProposal({ price, from: "user" });

    if (!id || id.startsWith("new-")) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chatId: id || "new-chat",
        senderId: profile?.id ?? "user-1",
        senderRole: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        createdAt: new Date(),
        read: false,
        messageType: "price_proposal",
        dealAmount: price,
      };
      setMessages((prev) => [...prev, message]);
      return;
    }

    try {
      const payload = {
        chat_id: id,
        sender_id: profile?.id ?? "",
        sender_role: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        message_type: "price_proposal",
        deal_amount: price,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data: inserted } = (await (supabase as any)
        .from("chat_messages")
        .insert(payload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      if (inserted) {
        const mapped = {
          id: inserted.id,
          chatId: inserted.chat_id,
          senderId: inserted.sender_id,
          senderRole: inserted.sender_role,
          content: inserted.content ?? "",
          imageUrl: inserted.image_url ?? undefined,
          createdAt: inserted.created_at
            ? new Date(inserted.created_at)
            : new Date(),
          read: !!inserted.read,
          messageType: inserted.message_type as ChatMessage["messageType"],
          dealAmount: inserted.deal_amount ?? undefined,
        } as ChatMessage;
        setMessages((prev) => [...prev, mapped]);
      }

      // Auto accept the counter-proposal as well
      const senderId =
        existingChat?.store_id ?? existingChat?.worker_id ?? "system";
      const senderRole = existingChat?.store_id
        ? "store"
        : existingChat?.worker_id
          ? "worker"
          : "system";
      const acceptPayload = {
        chat_id: id,
        sender_id: senderId as string,
        sender_role: senderRole,
        content: `${price?.toLocaleString()}₮-р зөвшөөрлөө ✓`,
        message_type: "deal_accepted",
        deal_amount: price,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];

      const { data: acc } = (await (supabase as any)
        .from("chat_messages")
        .insert(acceptPayload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      if (acc) {
        await (supabase as any)
          .from("chats")
          .update({
            status: "agreed",
            agreed_price: price,
            last_message: acc.content,
          })
          .eq("id", id);

        const mapped = {
          id: acc.id,
          chatId: acc.chat_id,
          senderId: acc.sender_id,
          senderRole: acc.sender_role,
          content: acc.content ?? "",
          imageUrl: acc.image_url ?? undefined,
          createdAt: acc.created_at ? new Date(acc.created_at) : new Date(),
          read: !!acc.read,
          messageType: acc.message_type as ChatMessage["messageType"],
          dealAmount: acc.deal_amount ?? undefined,
        } as ChatMessage;

        setMessages((prev) => [...prev, mapped]);
        setChatStatus("agreed");
        setAgreedPrice(price);
        setCurrentProposal(null);
        setShowDealConfirmed(true);
      }
    } catch (err) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chatId: id || "new-chat",
        senderId: profile?.id ?? "user-1",
        senderRole: "user",
        content: `${price?.toLocaleString()}₮ санал болгож байна`,
        createdAt: new Date(),
        read: false,
        messageType: "price_proposal",
        dealAmount: price,
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleDealAccepted = async (price: number) => {
    setAgreedPrice(price);
    setChatStatus("agreed");
    setCurrentProposal(null);
    setShowDealConfirmed(true);

    // DB-backed acceptance when chat exists
    if (id && !id.startsWith("new-")) {
      try {
        const senderId =
          existingChat?.store_id ??
          existingChat?.worker_id ??
          profile?.id ??
          "";
        const senderRole = existingChat?.store_id
          ? "store"
          : existingChat?.worker_id
            ? "worker"
            : "system";
        const payload = {
          chat_id: id,
          sender_id: senderId as string,
          sender_role: senderRole,
          content: `${price?.toLocaleString()}₮-р тохиролцлоо ✓`,
          message_type: "deal_accepted",
          deal_amount: price,
        } as Database["public"]["Tables"]["chat_messages"]["Insert"];

        const { data: inserted } = (await (supabase as any)
          .from("chat_messages")
          .insert(payload)
          .select()
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
          error: unknown;
        };

        if (inserted) {
          const mapped = {
            id: inserted.id,
            chatId: inserted.chat_id,
            senderId: inserted.sender_id,
            senderRole: inserted.sender_role,
            content: inserted.content ?? "",
            imageUrl: inserted.image_url ?? undefined,
            createdAt: inserted.created_at
              ? new Date(inserted.created_at)
              : new Date(),
            read: !!inserted.read,
            messageType: inserted.message_type as ChatMessage["messageType"],
            dealAmount: inserted.deal_amount ?? undefined,
          } as ChatMessage;

          setMessages((prev) => [...prev, mapped]);

          await (supabase as any)
            .from("chats")
            .update({
              status: "agreed",
              agreed_price: price,
              last_message: mapped.content,
            })
            .eq("id", id);
        }
      } catch (err) {
        // fallback: local append
        const message: ChatMessage = {
          id: Date.now().toString(),
          chatId: id || "new-chat",
          senderId: profile?.id ?? "user-1",
          senderRole: "user",
          content: `${price?.toLocaleString()}₮-р тохиролцлоо ✓`,
          createdAt: new Date(),
          read: true,
          messageType: "deal_accepted",
          dealAmount: price,
        };
        setMessages((prev) => [...prev, message]);
      }

      return;
    }

    // local-preview flow for new chats
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: id || "new-chat",
      senderId: store?.id || worker?.id || "owner-1",
      senderRole: store ? "store" : "worker",
      content: `${price?.toLocaleString()}₮-р тохиролцлоо ✓`,
      createdAt: new Date(),
      read: true,
      messageType: "deal_accepted",
      dealAmount: price,
    };
    setMessages((prev) => [...prev, message]);
  };

  const uploadToStorage = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("chat-media")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const urlRes = supabase.storage.from("chat-media").getPublicUrl(path);
    return urlRes.data?.publicUrl ?? null;
  };

  // Create a new chat row and send the first message. Navigates to the created chat and returns created message+chat.
  const createChatAndSend = async (
    chatInit: Partial<Database["public"]["Tables"]["chats"]["Insert"]>,
    messageInit: Database["public"]["Tables"]["chat_messages"]["Insert"],
  ) => {
    try {
      const { data: chatRow } = (await (supabase as any)
        .from("chats")
        .insert(chatInit)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chats"]["Row"] | null;
        error: unknown;
      };

      if (!chatRow) throw new Error("Failed to create chat");

      // insert first message
      const payload = {
        ...messageInit,
        chat_id: chatRow.id,
      } as Database["public"]["Tables"]["chat_messages"]["Insert"];
      const { data: msg } = (await (supabase as any)
        .from("chat_messages")
        .insert(payload)
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
        error: unknown;
      };

      // update chat last_message
      try {
        await (supabase as any)
          .from("chats")
          .update({ last_message: msg?.content ?? messageInit.content })
          .eq("id", chatRow.id);
      } catch (e) {
        /* ignore */
      }

      // navigate to created chat
      navigate(`/chat/${chatRow.id}`, { replace: true, state: { ...state } });

      // return both for local state update if needed
      return { chat: chatRow, message: msg };
    } catch (e) {
      console.error("createChatAndSend failed", e);
      return null;
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // If this is an existing DB chat, insert message into DB.
    if (id && !id.startsWith("new-")) {
      try {
        const payload = {
          chat_id: id,
          sender_id: profile?.id ?? "",
          sender_role: "user",
          content: newMessage.trim(),
          message_type: "text",
        } as Database["public"]["Tables"]["chat_messages"]["Insert"];

        const { data: inserted } = (await (supabase as any)
          .from("chat_messages")
          .insert(payload)
          .select()
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
          error: unknown;
        };

        if (inserted) {
          const mapped = {
            id: inserted.id,
            chatId: inserted.chat_id,
            senderId: inserted.sender_id,
            senderRole: inserted.sender_role,
            content: inserted.content ?? "",
            imageUrl: inserted.image_url ?? undefined,
            createdAt: inserted.created_at
              ? new Date(inserted.created_at)
              : new Date(),
            read: !!inserted.read,
            messageType: inserted.message_type as ChatMessage["messageType"],
            dealAmount: inserted.deal_amount ?? undefined,
          } as ChatMessage;

          setMessages((prev) => [...prev, mapped]);
          setNewMessage("");

          // update chat's last_message quickly
          await (supabase as any)
            .from("chats")
            .update({ last_message: mapped.content })
            .eq("id", id);
        }
      } catch (e) {
        // fall back to local append
        const message: ChatMessage = {
          id: Date.now().toString(),
          chatId: id || "new-chat",
          senderId: profile?.id ?? "user-1",
          senderRole: "user",
          content: newMessage.trim(),
          createdAt: new Date(),
          read: false,
          messageType: "text",
        };
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }

      return;
    }

    // Create new DB chat and send text message
    const chatInit = {
      user_id: profile?.id ?? "",
      store_id: state.storeId ?? store?.id ?? null,
      worker_id: state.workerId ?? worker?.id ?? null,
      type: state.storeId || store?.id ? "store" : "service",
      status: "negotiating",
      last_message: newMessage.trim(),
    } as Partial<Database["public"]["Tables"]["chats"]["Insert"]>;

    const messageInit = {
      sender_id: profile?.id ?? "",
      sender_role: "user",
      content: newMessage.trim(),
      message_type: "text",
    } as Database["public"]["Tables"]["chat_messages"]["Insert"];

    const res = await createChatAndSend(chatInit, messageInit);
    if (res?.message && res.chat) {
      const m = res.message;
      const mapped = {
        id: m.id,
        chatId: m.chat_id,
        senderId: m.sender_id,
        senderRole: m.sender_role,
        content: m.content ?? "",
        imageUrl: m.image_url ?? undefined,
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        read: !!m.read,
        messageType: m.message_type as ChatMessage["messageType"],
        dealAmount: m.deal_amount ?? undefined,
      } as ChatMessage;
      setExistingChat(res.chat);
      setMessages((prev) => [...prev, mapped]);
    }
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (id && !id.startsWith("new-")) {
      try {
        const url = await uploadToStorage(file, "user-chat");
        if (!url) return;

        const payload = {
          chat_id: id,
          sender_id: profile?.id ?? "",
          sender_role: "user",
          content: "Зураг илгээлээ",
          image_url: url,
          message_type: "image",
        } as Database["public"]["Tables"]["chat_messages"]["Insert"];

        const { data: inserted } = (await (supabase as any)
          .from("chat_messages")
          .insert(payload)
          .select()
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["chat_messages"]["Row"] | null;
          error: unknown;
        };

        if (inserted) {
          const mapped = {
            id: inserted.id,
            chatId: inserted.chat_id,
            senderId: inserted.sender_id,
            senderRole: inserted.sender_role,
            content: inserted.content ?? "",
            imageUrl: inserted.image_url ?? undefined,
            createdAt: inserted.created_at
              ? new Date(inserted.created_at)
              : new Date(),
            read: !!inserted.read,
            messageType: inserted.message_type as ChatMessage["messageType"],
            dealAmount: inserted.deal_amount ?? undefined,
          } as ChatMessage;
          setMessages((prev) => [...prev, mapped]);
        }
      } catch (err) {
        // fallback to client preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const message: ChatMessage = {
            id: Date.now().toString(),
            chatId: id || "new-chat",
            senderId: profile?.id ?? "user-1",
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

      return;
    }

    // fallback: create chat in DB then send image message (after upload)
    const url = await uploadToStorage(file, "user-chat");
    if (!url) return;

    const chatInit = {
      user_id: profile?.id ?? "",
      store_id: state.storeId ?? store?.id ?? null,
      worker_id: state.workerId ?? worker?.id ?? null,
      type: state.storeId || store?.id ? "store" : "service",
      status: "negotiating",
      last_message: "Зураг илгээлээ",
    } as Partial<Database["public"]["Tables"]["chats"]["Insert"]>;

    const messageInit = {
      sender_id: profile?.id ?? "",
      sender_role: "user",
      content: "Зураг илгээлээ",
      image_url: url,
      message_type: "image",
    } as Database["public"]["Tables"]["chat_messages"]["Insert"];

    const res = await createChatAndSend(chatInit, messageInit);
    if (res?.message && res.chat) {
      const m = res.message;
      const mapped = {
        id: m.id,
        chatId: m.chat_id,
        senderId: m.sender_id,
        senderRole: m.sender_role,
        content: m.content ?? "",
        imageUrl: m.image_url ?? undefined,
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        read: !!m.read,
        messageType: m.message_type as ChatMessage["messageType"],
        dealAmount: m.deal_amount ?? undefined,
      } as ChatMessage;
      setExistingChat(res.chat);
      setMessages((prev) => [...prev, mapped]);
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

  const isMyMessage = (senderId: string) => senderId === profile?.id;
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
      <div className="flex-1 flex h-5/6 flex-col max-w-4xl mx-auto w-full lg:my-6 lg:rounded-2xl lg:border lg:border-border lg:overflow-hidden lg:shadow-lg bg-background">
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
                    ? `${agreedPrice?.toLocaleString()}₮`
                    : `~${expectedPrice?.toLocaleString()}₮`}
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
                          {item.quantity} x {item.price?.toLocaleString()}₮
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
                orderId={order?.id}
                showContinueShopping={true}
                onContinueShopping={() => navigate("/stores")}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Price Input for User - Initial or during negotiation when no active proposal from other side */}
        {messages?.length === 0 &&
          (chatStatus === "initial" ||
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
