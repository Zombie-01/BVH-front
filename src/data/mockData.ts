import {
  Store,
  ServiceWorker,
  Product,
  Order,
  Chat,
  ChatMessage,
} from "@/types";

export const mockStores: Store[] = [
  {
    id: "1",
    name: "Барилгын Материал ХХК",
    description: "Барилгын бүх төрлийн материал, багаж хэрэгсэл",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    rating: 4.8,
    reviewCount: 245,
    category: "building",
    location: "Хан-Уул дүүрэг",
    isOpen: true,
    phone: "99001122",
  },
  {
    id: "2",
    name: "Төмөр Хийц Дэлгүүр",
    description: "Төмөр хийц, арматур, металл бүтээгдэхүүн",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    rating: 4.6,
    reviewCount: 189,
    category: "metal",
    location: "Баянзүрх дүүрэг",
    isOpen: true,
    phone: "99002233",
  },
  {
    id: "3",
    name: "Цахилгаан Барааны Төв",
    description: "Цахилгаан хэрэгсэл, утас кабель, гэрэлтүүлэг",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    rating: 4.9,
    reviewCount: 312,
    category: "electrical",
    location: "Сүхбаатар дүүрэг",
    isOpen: false,
    phone: "99003344",
  },
  {
    id: "4",
    name: "Сантехникийн Дэлгүүр",
    description: "Сантехник, усны хоолой, ванн угаалтуур",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    rating: 4.5,
    reviewCount: 156,
    category: "plumbing",
    location: "Чингэлтэй дүүрэг",
    isOpen: true,
    phone: "99004455",
  },
  {
    id: "5",
    name: "Будаг Лак Төв",
    description: "Дотор гадна будаг, лак, будагны хэрэгсэл",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
    rating: 4.7,
    reviewCount: 203,
    category: "paint",
    location: "Сонгинохайрхан дүүрэг",
    isOpen: true,
    phone: "99005566",
  },
];

export const mockServiceWorkers: ServiceWorker[] = [
  {
    id: "1",
    name: "Баярсайхан Б.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    specialty: "Цахилгаанчин",
    rating: 4.9,
    completedJobs: 156,
    badges: ["Шилдэг мэргэжилтэн", "Хурдан ажил"],
    hourlyRate: 50000,
    isAvailable: true,
    phone: "88001122",
    description: "Цахилгааны засвар үйлчилгээ, шинэ суурилуулалт",
  },
  {
    id: "2",
    name: "Батбаяр Г.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    specialty: "Сантехникч",
    rating: 4.8,
    completedJobs: 89,
    badges: ["Найдвартай", "Чанартай"],
    hourlyRate: 45000,
    isAvailable: true,
    phone: "88002233",
    description: "Сантехникийн бүх төрлийн засвар",
  },
  {
    id: "3",
    name: "Дорж Э.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    specialty: "Мужаан",
    rating: 4.7,
    completedJobs: 234,
    badges: ["Туршлагатай"],
    hourlyRate: 40000,
    isAvailable: false,
    phone: "88003344",
    description: "Мод эдлэл, тавилга хийх, засварлах",
  },
  {
    id: "4",
    name: "Оюунбат Н.",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face",
    specialty: "Будагчин",
    rating: 4.6,
    completedJobs: 67,
    badges: ["Шинэ гишүүн"],
    hourlyRate: 35000,
    isAvailable: true,
    phone: "88004455",
    description: "Дотор гадна будаг, ханын цаас",
  },
  {
    id: "5",
    name: "Энхбаяр Т.",
    avatar:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face",
    specialty: "Плиткачин",
    rating: 4.9,
    completedJobs: 178,
    badges: ["Шилдэг мэргэжилтэн", "Хамгийн хурдан"],
    hourlyRate: 55000,
    isAvailable: true,
    phone: "88005566",
    description: "Хавтан тавих, угаалгын өрөөний засвар",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    storeId: "1",
    name: "Цемент ПЦ-400",
    description:
      "Чанартай портланд цемент. Барилгын суурь, хана, шал болон бусад бетон ажилд хэрэглэнэ.",
    price: 18500,
    unit: "уут",
    image:
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=200&h=200&fit=crop",
    category: "Цемент",
    inStock: true,
    specifications: [
      { label: "Марк", value: "ПЦ-400" },
      { label: "Жин", value: "50кг" },
      { label: "Үйлдвэр", value: "УБЦЗ" },
    ],
  },
  {
    id: "2",
    storeId: "1",
    name: "Элс (Цэвэр)",
    description: "Барилгын цэвэр элс. Зуурмаг хийхэд тохиромжтой.",
    price: 85000,
    unit: "куб.м",
    image:
      "https://images.unsplash.com/photo-1558618047-f4b511d0d508?w=200&h=200&fit=crop",
    category: "Элс хайрга",
    inStock: true,
    specifications: [
      { label: "Төрөл", value: "Цэвэр элс" },
      { label: "Хэмжээ", value: "1 куб.м" },
    ],
  },
  {
    id: "3",
    storeId: "1",
    name: "Тоосго (Улаан)",
    description: "Улаан шатаасан тоосго. Хана өрөхөд.",
    price: 450,
    unit: "ш",
    image:
      "https://images.unsplash.com/photo-1590846083693-f23fdede538d?w=200&h=200&fit=crop",
    category: "Тоосго",
    inStock: true,
    specifications: [
      { label: "Хэмжээ", value: "250x120x65мм" },
      { label: "Марк", value: "M-150" },
    ],
  },
  {
    id: "4",
    storeId: "2",
    name: "Арматур 12мм",
    description: "А3 арматур. Бетон армдуулахад.",
    price: 4500,
    unit: "м",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&h=200&fit=crop",
    category: "Төмөр хийц",
    inStock: true,
    specifications: [
      { label: "Диаметр", value: "12мм" },
      { label: "Марк", value: "А3" },
      { label: "Урт", value: "11.7м" },
    ],
  },
  {
    id: "5",
    storeId: "2",
    name: "Профиль труба 40x40",
    description: "Хар төмөр профиль. Хаалга, цонхны хүрээ хийхэд.",
    price: 12000,
    unit: "м",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    category: "Төмөр хийц",
    inStock: true,
    specifications: [
      { label: "Хэмжээ", value: "40x40мм" },
      { label: "Зузаан", value: "2мм" },
    ],
  },
  {
    id: "6",
    storeId: "3",
    name: "Кабель ВВГ 3x2.5",
    description: "Цахилгааны кабель. Розетка, гэрлийн утас.",
    price: 3500,
    unit: "м",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop",
    category: "Цахилгаан",
    inStock: true,
    specifications: [
      { label: "Огтлол", value: "3x2.5мм²" },
      { label: "Төрөл", value: "ВВГ" },
    ],
  },
];

export const mockChats: Chat[] = [
  {
    id: "chat-1",
    orderId: "1",
    userId: "user-1",
    storeId: "1",
    type: "store",
    status: "agreed",
    expectedPrice: 355000,
    agreedPrice: 340000,
    items: [
      {
        productId: "1",
        productName: "Цемент ПЦ-400",
        quantity: 10,
        price: 18500,
        image:
          "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=200&h=200&fit=crop",
      },
      {
        productId: "2",
        productName: "Элс (Цэвэр)",
        quantity: 2,
        price: 85000,
        image:
          "https://images.unsplash.com/photo-1558618047-f4b511d0d508?w=200&h=200&fit=crop",
      },
    ],
    createdAt: new Date("2024-01-15"),
    lastMessage: "Тийм ээ, 340,000₮-р тохирлоо",
    unreadCount: 0,
  },
  {
    id: "chat-2",
    userId: "user-1",
    workerId: "1",
    type: "service",
    status: "negotiating",
    expectedPrice: 150000,
    serviceDescription: "Гэрийн цахилгааны засвар",
    createdAt: new Date("2024-01-16"),
    lastMessage: "Үнэ хэд вэ?",
    unreadCount: 2,
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    chatId: "chat-1",
    userId: "user-1",
    storeId: "1",
    type: "delivery",
    status: "in_progress",
    items: [
      {
        productId: "1",
        productName: "Цемент ПЦ-400",
        quantity: 10,
        price: 18500,
        image:
          "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=200&h=200&fit=crop",
      },
      {
        productId: "2",
        productName: "Элс (Цэвэр)",
        quantity: 2,
        price: 85000,
        image:
          "https://images.unsplash.com/photo-1558618047-f4b511d0d508?w=200&h=200&fit=crop",
      },
    ],
    expectedPrice: 355000,
    agreedPrice: 340000,
    totalAmount: 340000,
    deliveryAddress: "Хан-Уул дүүрэг, 11-р хороо",
    createdAt: new Date("2024-01-15"),
    confirmedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    chatId: "chat-2",
    userId: "user-1",
    workerId: "1",
    type: "service",
    status: "negotiating",
    expectedPrice: 150000,
    totalAmount: 0,
    serviceDescription: "Гэрийн цахилгааны засвар",
    createdAt: new Date("2024-01-16"),
  },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  "chat-1": [
    {
      id: "1",
      chatId: "chat-1",
      senderId: "store-1",
      senderRole: "store",
      content: "Сайн байна уу! Юугаар туслах вэ?",
      createdAt: new Date("2024-01-15T09:00:00"),
      read: true,
      messageType: "text",
    },
    {
      id: "2",
      chatId: "chat-1",
      senderId: "user-1",
      senderRole: "user",
      content: "Сайн байна уу, цемент ПЦ-400 10 уут, элс 2 куб авмаар байна",
      createdAt: new Date("2024-01-15T09:01:00"),
      read: true,
      messageType: "text",
    },
    {
      id: "3",
      chatId: "chat-1",
      senderId: "store-1",
      senderRole: "store",
      content: "Нийт 355,000₮ болно. Та 340,000₮-р авах уу?",
      createdAt: new Date("2024-01-15T09:02:00"),
      read: true,
      messageType: "deal_proposal",
      dealAmount: 340000,
    },
    {
      id: "4",
      chatId: "chat-1",
      senderId: "user-1",
      senderRole: "user",
      content: "Тийм ээ, 340,000₮-р тохирлоо",
      createdAt: new Date("2024-01-15T09:03:00"),
      read: true,
      messageType: "deal_accepted",
      dealAmount: 340000,
    },
  ],
  "chat-2": [
    {
      id: "1",
      chatId: "chat-2",
      senderId: "user-1",
      senderRole: "user",
      content: "Сайн байна уу, гэрийн цахилгааны засвар хийлгэмээр байна",
      createdAt: new Date("2024-01-16T10:00:00"),
      read: true,
      messageType: "text",
    },
    {
      id: "2",
      chatId: "chat-2",
      senderId: "worker-1",
      senderRole: "worker",
      content: "Сайн байна уу! Ямар төрлийн засвар хэрэгтэй вэ?",
      createdAt: new Date("2024-01-16T10:01:00"),
      read: false,
      messageType: "text",
    },
  ],
};

export const categories = [
  { id: "all", label: "Бүгд", icon: "🏗️" },
  { id: "building", label: "Барилгын материал", icon: "🧱" },
  { id: "metal", label: "Төмөр хийц", icon: "⚙️" },
  { id: "electrical", label: "Цахилгаан", icon: "💡" },
  { id: "plumbing", label: "Сантехник", icon: "🔧" },
  { id: "paint", label: "Будаг лак", icon: "🎨" },
  { id: "tools", label: "Багаж хэрэгсэл", icon: "🔨" },
];

export const serviceCategories = [
  { id: "all", label: "Бүгд", icon: "👷" },
  {
    id: "electrician",
    label: "Цахилгаанчин",
    icon: "⚡",
    specialty: "Цахилгаанчин",
  },
  { id: "plumber", label: "Сантехникч", icon: "🔧", specialty: "Сантехникч" },
  { id: "carpenter", label: "Мужаан", icon: "🪚", specialty: "Мужаан" },
  { id: "painter", label: "Будагчин", icon: "🖌️", specialty: "Будагчин" },
  { id: "tiler", label: "Плиткачин", icon: "🔲", specialty: "Плиткачин" },
  { id: "welder", label: "Гагнуурчин", icon: "🔥", specialty: "Гагнуурчин" },
];
