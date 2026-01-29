import { motion } from "framer-motion";
import {
  Star,
  ThumbsUp,
  Award,
  TrendingUp,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  jobTitle: string;
  createdAt: Date;
  helpful: number;
}

const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Энхбаяр Г.",
    customerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    rating: 5,
    comment:
      "Маш сайн мэргэжилтэн. Ажлаа хугацаандаа дуусгаж, бүх зүйлийг цэвэрхэн хийсэн.",
    jobTitle: "Байшингийн утас шинэчлэх",
    createdAt: new Date("2024-01-18"),
    helpful: 12,
  },
  {
    id: "2",
    customerName: "Мөнхжин С.",
    customerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 5,
    comment: "Хурдан, найдвартай ажилласан. Дахин ажиллуулна.",
    jobTitle: "LED гэрэлтүүлэг",
    createdAt: new Date("2024-01-15"),
    helpful: 8,
  },
  {
    id: "3",
    customerName: "Батболд Д.",
    customerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 4,
    comment: "Сайн ажилласан, гэхдээ бага зэрэг хоцорсон.",
    jobTitle: "Розетка засвар",
    createdAt: new Date("2024-01-10"),
    helpful: 5,
  },
  {
    id: "4",
    customerName: "Оюунтөгс Б.",
    customerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 5,
    comment: "Маш их туршлагатай. Асуудлыг хурдан олж засварласан.",
    jobTitle: "Цахилгааны засвар",
    createdAt: new Date("2024-01-05"),
    helpful: 15,
  },
];

const ratingDistribution = [
  { stars: 5, count: 120, percentage: 75 },
  { stars: 4, count: 28, percentage: 17 },
  { stars: 3, count: 8, percentage: 5 },
  { stars: 2, count: 3, percentage: 2 },
  { stars: 1, count: 1, percentage: 1 },
];

const badges = [
  {
    icon: "⚡",
    label: "Хурдан ажил",
    description: "50+ ажлыг цагтаа дуусгасан",
  },
  {
    icon: "🏆",
    label: "Шилдэг мэргэжилтэн",
    description: "Сарын шилдэг 10-т багтсан",
  },
  {
    icon: "💯",
    label: "Найдвартай",
    description: "100% хэрэглэгчийн сэтгэл ханамж",
  },
];

export default function WorkerRatings() {
  const averageRating = 4.9;
  const totalReviews = 160;

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-accent via-yellow-400 to-orange-400 pt-safe px-4 pb-6 lg:rounded-b-3xl">
        <div className="pt-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-accent-foreground">
            Миний үнэлгээ
          </h1>
          <p className="text-accent-foreground/80 text-sm mt-1">
            Хэрэглэгчдийн сэтгэгдэл
          </p>

          {/* Rating Summary */}
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <span className="text-5xl font-bold text-accent-foreground">
                    {averageRating}
                  </span>
                  <Star className="w-10 h-10 text-accent-foreground fill-accent-foreground" />
                </div>
                <p className="text-accent-foreground/70 text-sm mt-1">
                  {totalReviews} үнэлгээ
                </p>
              </div>
              <div className="flex-1 max-w-xs ml-6 space-y-2">
                {ratingDistribution.map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-2">
                    <span className="text-xs text-accent-foreground/70 w-4">
                      {dist.stars}
                    </span>
                    <Star className="w-3 h-3 text-accent-foreground fill-accent-foreground" />
                    <Progress value={dist.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-accent-foreground/70 w-8">
                      {dist.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Badges */}
      <section className="px-4 py-6 max-w-7xl mx-auto">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Шагнал
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
              <div className="text-3xl">{badge.icon}</div>
              <div>
                <h4 className="font-semibold text-foreground">{badge.label}</h4>
                <p className="text-xs text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
            <span className="text-2xl font-bold text-success">98%</span>
            <p className="text-xs text-muted-foreground mt-1">Сэтгэл ханамж</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <ThumbsUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="text-2xl font-bold text-primary">156</span>
            <p className="text-xs text-muted-foreground mt-1">Дууссан ажил</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-4 text-center">
            <Star className="w-6 h-6 text-warning mx-auto mb-2" />
            <span className="text-2xl font-bold text-warning">4.9</span>
            <p className="text-xs text-muted-foreground mt-1">Дундаж үнэлгээ</p>
          </div>
          <div className="bg-secondary/10 rounded-xl p-4 text-center">
            <MessageCircle className="w-6 h-6 text-secondary mx-auto mb-2" />
            <span className="text-2xl font-bold text-secondary">92%</span>
            <p className="text-xs text-muted-foreground mt-1">Хариу өгсөн</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <h2 className="font-bold text-foreground mb-4">Сүүлийн сэтгэгдлүүд</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img
                  src={review.customerAvatar}
                  alt={review.customerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      {review.customerName}
                    </h4>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < review.rating
                              ? "text-accent fill-accent"
                              : "text-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {review.jobTitle}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-foreground">{review.comment}</p>

              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("mn-MN")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful} хүнд тусалсан</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
