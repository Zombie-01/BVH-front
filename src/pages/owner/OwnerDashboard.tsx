import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stats = [
  { 
    label: 'Өнөөдрийн борлуулалт', 
    value: '₮2.4M', 
    change: '+12%', 
    trend: 'up',
    icon: DollarSign,
    color: 'bg-success/10 text-success'
  },
  { 
    label: 'Захиалга', 
    value: '24', 
    change: '+8', 
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-primary/10 text-primary'
  },
  { 
    label: 'Шинэ чат', 
    value: '12', 
    change: '+5', 
    trend: 'up',
    icon: MessageCircle,
    color: 'bg-warning/10 text-warning'
  },
  { 
    label: 'Хэрэглэгч', 
    value: '156', 
    change: '+23', 
    trend: 'up',
    icon: Users,
    color: 'bg-secondary/10 text-secondary'
  },
];

const recentOrders = [
  {
    id: '1',
    customer: 'Батболд Д.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    items: 'Цемент ПЦ-400 x10, Элс x2',
    total: 340000,
    status: 'negotiating',
    time: '5 минутын өмнө',
  },
  {
    id: '2',
    customer: 'Оюунтөгс Б.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    items: 'Арматур 12мм x20м',
    total: 90000,
    status: 'confirmed',
    time: '15 минутын өмнө',
  },
  {
    id: '3',
    customer: 'Энхбаяр Г.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    items: 'Тоосго x500ш',
    total: 225000,
    status: 'in_progress',
    time: '1 цагийн өмнө',
  },
];

const pendingChats = [
  {
    id: '1',
    customer: 'Мөнхжин С.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'Энэ барааны үнэ хэд вэ?',
    unread: 3,
    time: '2 минутын өмнө',
  },
  {
    id: '2',
    customer: 'Болд Т.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'Хүргэлт хэзээ ирэх вэ?',
    unread: 1,
    time: '10 минутын өмнө',
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  negotiating: { label: 'Тохиролцож байна', color: 'bg-warning' },
  confirmed: { label: 'Баталгаажсан', color: 'bg-success' },
  in_progress: { label: 'Явагдаж байна', color: 'bg-primary' },
};

export default function OwnerDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-secondary via-secondary to-gray-700 pt-safe px-4 pb-6 lg:rounded-b-3xl">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Сайн байна уу 🏪</p>
              <h1 className="text-2xl font-bold text-white">Барилгын Материал ХХК</h1>
            </div>
            <Badge className="bg-success text-success-foreground">Нээлттэй</Badge>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="px-4 -mt-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  <span className={cn(
                    "text-xs flex items-center gap-0.5",
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  )}>
                    {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="px-4 py-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <section className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Сүүлийн захиалгууд
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/owner/orders')}>
              Бүгд
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, index) => {
              const status = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/owner/orders/${order.id}`)}
                >
                  <img
                    src={order.avatar}
                    alt={order.customer}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">{order.customer}</h4>
                      <Badge className={cn(status.color, "text-white text-2xs")}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary text-sm">₮{order.total.toLocaleString()}</span>
                    <p className="text-2xs text-muted-foreground">{order.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pending Chats */}
        <section className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-warning" />
              Хүлээгдэж буй чат
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/owner/chats')}>
              Бүгд
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {pendingChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                onClick={() => navigate(`/owner/chats/${chat.id}`)}
              >
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.customer}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                      <span className="text-2xs text-white font-bold">{chat.unread}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{chat.customer}</h4>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-2xs text-muted-foreground">{chat.time}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3" onClick={() => navigate('/owner/products')}>
              <Package className="w-5 h-5 mr-2" />
              <span>Бараа нэмэх</span>
            </Button>
            <Button className="h-auto py-3" onClick={() => navigate('/owner/orders')}>
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Тайлан харах</span>
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
