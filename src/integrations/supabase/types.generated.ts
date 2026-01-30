// This file is generated from supabase-schema.sql for Supabase types.
// Update this file if the schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          role: "user" | "store_owner" | "driver" | "service_worker";
          avatar: string | null;
          vehicle_type: "walking" | "bike" | "moped" | "mini_truck" | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          image: string | null;
          logo: string | null;
          rating: number | null;
          review_count: number | null;
          category: string | null;
          location: string | null;
          phone: string | null;
          is_open: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["stores"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["stores"]["Row"]>;
        Relationships: [];
      };
      store_categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["store_categories"]["Row"]
        >;
        Update: Partial<
          Database["public"]["Tables"]["store_categories"]["Row"]
        >;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          price: number;
          unit: string | null;
          image: string | null;
          category: string | null;
          in_stock: boolean;
          specifications: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      service_workers: {
        Row: {
          id: string;
          profile_id: string;
          specialty: string;
          description: string | null;
          hourly_rate: number | null;
          rating: number | null;
          completed_jobs: number | null;
          badges: string[] | null;
          is_available: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["service_workers"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["service_workers"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          store_id: string | null;
          worker_id: string | null;
          driver_id: string | null;
          chat_id: string | null;
          type: string;
          status:
            | "negotiating"
            | "pending"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          expected_price: number | null;
          agreed_price: number | null;
          total_amount: number | null;
          delivery_address: string | null;
          service_description: string | null;
          created_at: string | null;
          confirmed_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price: number;
          image: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          order_id: string | null;
          user_id: string;
          store_id: string | null;
          worker_id: string | null;
          driver_id: string | null;
          type: "store" | "service" | "driver";
          status: "negotiating" | "agreed" | "cancelled";
          expected_price: number | null;
          agreed_price: number | null;
          service_description: string | null;
          last_message: string | null;
          unread_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["chats"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["chats"]["Row"]>;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          sender_role: string;
          content: string | null;
          image_url: string | null;
          message_type:
            | "text"
            | "image"
            | "deal_proposal"
            | "deal_accepted"
            | "deal_rejected"
            | "system"
            | "price_proposal";
          deal_amount: number | null;
          read: boolean;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
        Relationships: [];
      };
      delivery_tasks: {
        Row: {
          id: string;
          order_id: string;
          driver_id: string;
          pickup_location: string;
          delivery_location: string;
          status: "assigned" | "picked_up" | "in_transit" | "delivered";
          estimated_time: number | null;
          distance: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["delivery_tasks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["delivery_tasks"]["Row"]>;
        Relationships: [];
      };
      service_jobs: {
        Row: {
          id: string;
          user_id: string;
          worker_id: string;
          description: string | null;
          status:
            | "pending"
            | "quoted"
            | "accepted"
            | "in_progress"
            | "completed";
          quoted_price: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["service_jobs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["service_jobs"]["Row"]>;
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          job_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          photo_url: string | null;
          completed_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["milestones"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["milestones"]["Row"]>;
        Relationships: [];
      };
    };
    Enums: {
      user_role: "user" | "store_owner" | "driver" | "service_worker";
      vehicle_type: "walking" | "bike" | "moped" | "mini_truck";
      order_status:
        | "negotiating"
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled";
      chat_type: "store" | "service" | "driver";
      chat_status: "negotiating" | "agreed" | "cancelled";
      delivery_status: "assigned" | "picked_up" | "in_transit" | "delivered";
      job_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed";
      message_type:
        | "text"
        | "image"
        | "deal_proposal"
        | "deal_accepted"
        | "deal_rejected"
        | "system"
        | "price_proposal";
    };
  };
};
