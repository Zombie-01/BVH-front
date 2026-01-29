import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  MessageCircle,
  ChevronRight,
  MapPin,
  Phone,
  XCircle,
  Plus
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderDetailModal } from '@/components/modals/OrderDetailModal';
import { OrderModal } from '@/components/modals/OrderModal';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { toast } from 'sonner';

interface OwnerOrder {
  id: string;
  customer: {
    name: string;
    avatar: string;
    phone: string;
  };
  items: { name: string; quantity: number; price: number }[];
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  createdAt: Date;
  driver?: { name: string; phone: string };
}

const initialOrders: OwnerOrder[] = [
  {
    id: '1',
    customer: {
      name: 'Батболд Д.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      phone: '99001122',
    },
    items: [
      { name: 'Цемент ПЦ-400', quantity: 10, price: 18500 },
      { name: 'Элс (Цэвэр)', quantity: 2, price: 85000 },
    ],
    status: 'negotiating',
    totalAmount: 355000,
    deliveryAddress: 'Хан-Уул дүүрэг, 15-р хороо',
    createdAt: new Date('2024-01-17T09:30:00'),
  },
  {
    id: '2',
    customer: {
      name: 'Оюунтөгс Б.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      phone: '99112233',
    },
    items: [
      { name: 'Арматур 12мм', quantity: 20, price: 4500 },
    ],
    status: 'confirmed',
    totalAmount: 90000,
    deliveryAddress: 'Баянзүрх дүүрэг, 3-р хороо',
    createdAt: new Date('2024-01-17T08:15:00'),
  },
  {
    id: '3',
    customer: {
      name: 'Энхбаяр Г.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      phone: '99223344',
    },
    items: [
      { name: 'Тоосго (Улаан)', quantity: 500, price: 450 },
    ],
    status: 'in_progress',
    totalAmount: 225000,
    deliveryAddress: 'Сүхбаатар дүүрэг, 1-р хороо',
    createdAt: new Date('2024-01-16T14:00:00'),
    driver: { name: 'Болд Ж.', phone: '88001122' },
  },
  {
    id: '4',
    customer: {
      name: 'Мөнхжин С.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      phone: '99334455',
    },
    items: [
      { name: 'Кабель ВВГ 3x2.5', quantity: 100, price: 3500 },
    ],
    status: 'completed',
    totalAmount: 350000,
    deliveryAddress: 'Чингэлтэй дүүрэг, 7-р хороо',
    createdAt: new Date('2024-01-15T10:30:00'),
    driver: { name: 'Ганзориг Д.', phone: '88002233' },
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  negotiating: { label: 'Тохиролцож байна', color: 'bg-warning', icon: MessageCircle },
  pending: { label: 'Хүлээгдэж байна', color: 'bg-warning', icon: Clock },
  confirmed: { label: 'Баталгаажсан', color: 'bg-primary', icon: CheckCircle },
  in_progress: { label: 'Хүргэж байна', color: 'bg-success', icon: Truck },
  completed: { label: 'Дууссан', color: 'bg-muted', icon: CheckCircle },
  cancelled: { label: 'Цуцлагдсан', color: 'bg-destructive', icon: XCircle },
};

type FilterType = 'all' | 'active' | 'completed';

export default function OwnerOrders() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState<OwnerOrder[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OwnerOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateOrder = (orderData: {
    customer: { name: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    status: OrderStatus;
    deliveryAddress: string;
    notes?: string;
  }) => {
    const newOrder: OwnerOrder = {
      id: String(Date.now()),
      customer: {
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      },
      items: orderData.items,
      status: orderData.status,
      totalAmount: orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      deliveryAddress: orderData.deliveryAddress,
      createdAt: new Date(),
    };
    setOrders([newOrder, ...orders]);
    toast.success('Захиалга амжилттай үүсгэгдлээ');
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['negotiating', 'pending', 'confirmed', 'in_progress'].includes(order.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(order.status);
    return true;
  });

  const activeCount = orders.filter(o => ['negotiating', 'pending', 'confirmed', 'in_progress'].includes(o.status)).length;
  const todayRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleOrderClick = (order: OwnerOrder) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    toast.success('Захиалгын төлөв шинэчлэгдлээ');
  };

  const handleAssignDriver = (orderId: string) => {
    const driver = { name: 'Болд Ж.', phone: '88001122' };
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, driver, status: 'in_progress' as OrderStatus } : o
    ));
    toast.success('Жолооч амжилттай оноогдлоо');
  };

  const handleQuickConfirm = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdateStatus(orderId, 'confirmed');
  };

  const handleQuickAssign = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(orders.find(o => o.id === orderId) || null);
    setDetailModalOpen(true);
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Захиалгууд</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Бүх захиалгуудыг удирдах
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Захиалга үүсгэх
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-primary">{activeCount}</span>
            <p className="text-xs text-muted-foreground mt-1">Идэвхтэй</p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'completed').length}</span>
            <p className="text-xs text-muted-foreground mt-1">Дууссан</p>
          </div>
          <div className="bg-secondary/10 rounded-xl p-4 text-center">
            <span className="text-xl font-bold text-secondary">₮{(todayRevenue / 1000).toFixed(0)}K</span>
            <p className="text-xs text-muted-foreground mt-1">Орлого</p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'active', label: 'Идэвхтэй' },
            { id: 'completed', label: 'Дууссан' },
          ].map(f => (
            <Badge
              key={f.id}
              variant={filter === f.id ? 'default' : 'secondary'}
              className="cursor-pointer px-4 py-2"
              onClick={() => setFilter(f.id as FilterType)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Orders List */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOrderClick(order)}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-foreground">{order.customer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        #{order.id} • {new Date(order.createdAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(status.color, "text-white gap-1")}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Items */}
                <div className="mt-3 p-3 bg-muted rounded-xl">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.name} x{item.quantity}</span>
                      <span className="text-muted-foreground">₮{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-medium text-foreground">Нийт</span>
                    <span className="font-bold text-primary">₮{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm truncate">{order.deliveryAddress}</span>
                </div>

                {/* Driver Info */}
                {order.driver && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-success" />
                    <span className="text-foreground">{order.driver.name}</span>
                    <span className="text-muted-foreground">• {order.driver.phone}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Залгах
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Чат
                  </Button>
                  {order.status === 'negotiating' && (
                    <Button size="sm" onClick={(e) => handleQuickConfirm(order.id, e)}>
                      Батлах
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {order.status === 'confirmed' && !order.driver && (
                    <Button size="sm" onClick={(e) => handleQuickAssign(order.id, e)}>
                      Жолооч оноох
                      <Truck className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Захиалга байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор захиалга ирээгүй байна
            </p>
          </div>
        )}
      </section>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        onAssignDriver={handleAssignDriver}
      />

      {/* Create Order Modal */}
      <OrderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateOrder}
      />
    </AppLayout>
  );
}
