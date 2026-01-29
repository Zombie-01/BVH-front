import { DeliveryTask, DriverVehicleType } from '@/types';

export const vehicleTypes: { id: DriverVehicleType; label: string; icon: string; maxWeight: string; speed: string }[] = [
  { id: 'walking', label: 'Явган', icon: '🚶', maxWeight: '10кг', speed: 'Удаан' },
  { id: 'bike', label: 'Дугуй', icon: '🚲', maxWeight: '20кг', speed: 'Дунд' },
  { id: 'moped', label: 'Мопед', icon: '🛵', maxWeight: '50кг', speed: 'Хурдан' },
  { id: 'mini_truck', label: 'Жижиг ачааны машин', icon: '🚛', maxWeight: '500кг', speed: 'Хурдан' },
];

export const mockDeliveryTasks: (DeliveryTask & { 
  storeName: string; 
  customerName: string; 
  items: string[];
  weight: number;
  reward: number;
  vehicleRequired: DriverVehicleType;
})[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    driverId: '',
    pickupLocation: 'Барилгын Материал ХХК, Хан-Уул дүүрэг',
    deliveryLocation: 'Баянзүрх дүүрэг, 5-р хороо, 45-р байр',
    status: 'assigned',
    estimatedTime: 25,
    distance: 4.5,
    storeName: 'Барилгын Материал ХХК',
    customerName: 'Батбаяр Г.',
    items: ['Цемент ПЦ-400 x5', 'Элс 1 куб.м'],
    weight: 280,
    reward: 15000,
    vehicleRequired: 'mini_truck',
  },
  {
    id: '2',
    orderId: 'ORD-002',
    driverId: '',
    pickupLocation: 'Цахилгаан Барааны Төв, Сүхбаатар дүүрэг',
    deliveryLocation: 'Чингэлтэй дүүрэг, 3-р хороо',
    status: 'assigned',
    estimatedTime: 15,
    distance: 2.3,
    storeName: 'Цахилгаан Барааны Төв',
    customerName: 'Оюунбат Н.',
    items: ['Утас кабель 50м', 'Розетка x10'],
    weight: 8,
    reward: 5000,
    vehicleRequired: 'bike',
  },
  {
    id: '3',
    orderId: 'ORD-003',
    driverId: '',
    pickupLocation: 'Будаг Лак Төв, Сонгинохайрхан дүүрэг',
    deliveryLocation: 'Хан-Уул дүүрэг, 11-р хороо',
    status: 'assigned',
    estimatedTime: 20,
    distance: 3.8,
    storeName: 'Будаг Лак Төв',
    customerName: 'Энхбаяр Т.',
    items: ['Будаг 10л x2', 'Сойз багц'],
    weight: 25,
    reward: 8000,
    vehicleRequired: 'moped',
  },
  {
    id: '4',
    orderId: 'ORD-004',
    driverId: '',
    pickupLocation: 'Сантехникийн Дэлгүүр, Чингэлтэй дүүрэг',
    deliveryLocation: 'Баянгол дүүрэг, 7-р хороо',
    status: 'picked_up',
    estimatedTime: 18,
    distance: 3.2,
    storeName: 'Сантехникийн Дэлгүүр',
    customerName: 'Дорж Э.',
    items: ['Усны хоолой 5м'],
    weight: 5,
    reward: 4000,
    vehicleRequired: 'walking',
  },
];

export const mockCompletedTasks = [
  {
    id: 'c1',
    orderId: 'ORD-098',
    storeName: 'Төмөр Хийц Дэлгүүр',
    customerName: 'Баярсайхан Б.',
    deliveryLocation: 'Сүхбаатар дүүрэг, 1-р хороо',
    completedAt: new Date('2024-01-15T14:30:00'),
    reward: 12000,
    rating: 5,
  },
  {
    id: 'c2',
    orderId: 'ORD-097',
    storeName: 'Барилгын Материал ХХК',
    customerName: 'Ганбат С.',
    deliveryLocation: 'Хан-Уул дүүрэг, 3-р хороо',
    completedAt: new Date('2024-01-15T11:20:00'),
    reward: 18000,
    rating: 4,
  },
  {
    id: 'c3',
    orderId: 'ORD-096',
    storeName: 'Цахилгаан Барааны Төв',
    customerName: 'Түвшинбаяр Д.',
    deliveryLocation: 'Баянзүрх дүүрэг, 12-р хороо',
    completedAt: new Date('2024-01-14T16:45:00'),
    reward: 6000,
    rating: 5,
  },
];

export const driverStats = {
  todayEarnings: 45000,
  weekEarnings: 285000,
  monthEarnings: 1250000,
  totalDeliveries: 156,
  rating: 4.9,
  completionRate: 98,
};
