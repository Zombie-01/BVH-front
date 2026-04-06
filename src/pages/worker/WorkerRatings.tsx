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
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-5xl font-bold text-accent-foreground">
                    {averageRating}
                  </span>
                  <Star className="w-10 h-10 text-accent-foreground fill-accent-foreground" />
                </div>
                <p className="text-accent-foreground/70 text-sm mt-1">
                  {totalReviews} үнэлгээ
                </p>
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
        <div className="bg-card rounded-2xl p-8 text-center shadow-card border border-border">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Үнэлгээ нэмэгдээд эхлээгүй байна
          </p>
        </div>
      </section>
    </AppLayout>
  );
}
