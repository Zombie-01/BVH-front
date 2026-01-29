export type UserRole = "user" | "store_owner" | "driver" | "service_worker";

export type DriverVehicleType = "walking" | "bike" | "moped" | "mini_truck";

export type OrderStatus =
  | "negotiating"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ChatType = "store" | "service" | "driver";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  vehicleType?: DriverVehicleType;
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  location: string;
  isOpen: boolean;
  phone?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  inStock: boolean;
  specifications?: { label: string; value: string }[];
}

export interface ServiceWorker {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  completedJobs: number;
  badges: string[];
  hourlyRate: number;
  isAvailable: boolean;
  phone?: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  chatId: string;
  userId: string;
  storeId?: string;
  workerId?: string;
  driverId?: string;
  type: "delivery" | "service";
  status: OrderStatus;
  items?: OrderItem[];
  expectedPrice: number;
  agreedPrice?: number;
  totalAmount: number;
  deliveryAddress?: string;
  serviceDescription?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface Chat {
  id: string;
  orderId?: string;
  userId: string;
  storeId?: string;
  workerId?: string;
  driverId?: string;
  type: ChatType;
  status: "negotiating" | "agreed" | "cancelled";
  expectedPrice: number;
  agreedPrice?: number;
  items?: OrderItem[];
  serviceDescription?: string;
  createdAt: Date;
  lastMessage?: string;
  unreadCount: number;
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  driverId: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered";
  estimatedTime: number;
  distance: number;
}

export interface ServiceJob {
  id: string;
  userId: string;
  workerId: string;
  description: string;
  status: "pending" | "quoted" | "accepted" | "in_progress" | "completed";
  quotedPrice?: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  photoUrl?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: UserRole | "store" | "worker";
  content: string;
  imageUrl?: string;
  createdAt: Date;
  read: boolean;
  messageType?:
    | "text"
    | "image"
    | "deal_proposal"
    | "deal_accepted"
    | "deal_rejected"
    | "system"
    | "price_proposal";
  dealAmount?: number;
}
