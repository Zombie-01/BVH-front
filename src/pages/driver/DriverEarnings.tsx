import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { driverStats } from "@/data/driverData";

const periods = [
  { id: "today", label: "Өнөөдөр" },
  { id: "week", label: "7 хоног" },
  { id: "month", label: "Сар" },
];

const transactions = [
  {
    id: "1",
    type: "earning",
    description: "Хүргэлт #ORD-098",
    amount: 12000,
    time: "14:30",
  },
  {
    id: "2",
    type: "earning",
    description: "Хүргэлт #ORD-097",
    amount: 18000,
    time: "11:20",
  },
  {
    id: "3",
    type: "bonus",
    description: "Хурдан хүргэлтийн урамшуулал",
    amount: 5000,
    time: "11:25",
  },
  {
    id: "4",
    type: "earning",
    description: "Хүргэлт #ORD-096",
    amount: 6000,
    time: "09:45",
  },
  {
    id: "5",
    type: "withdrawal",
    description: "Хасалт - Банк руу",
    amount: -50000,
    time: "Өчигдөр",
  },
];

export default function DriverEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const getEarnings = () => {
    switch (selectedPeriod) {
      case "today":
        return driverStats.todayEarnings;
      case "week":
        return driverStats.weekEarnings;
      case "month":
        return driverStats.monthEarnings;
      default:
        return driverStats.todayEarnings;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-8">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Орлого</h1>
          <Button variant="outline-light" size="sm">
            <Wallet className="w-4 h-4" />
            Зарлага
          </Button>
        </div>

        {/* Period Selector */}
        <div className="mt-4 flex gap-2 bg-white/10 rounded-xl p-1">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.id
                  ? "bg-white text-primary"
                  : "text-white/80 hover:text-white"
              }`}>
              {period.label}
            </button>
          ))}
        </div>

        {/* Earnings Display */}
        <motion.div
          key={selectedPeriod}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center">
          <p className="text-white/70 text-sm">Нийт орлого</p>
          <h2 className="text-4xl font-bold text-white mt-1">
            ₮{getEarnings()?.toLocaleString()}
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2 text-white/80">
            <ArrowUpRight className="w-4 h-4 text-accent" />
            <span className="text-sm">+12% өмнөх хугацаанаас</span>
          </div>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <section className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-elevated">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {driverStats.totalDeliveries}
            </p>
            <p className="text-xs text-muted-foreground">Нийт хүргэлт</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-elevated">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {driverStats.completionRate}%
            </p>
            <p className="text-xs text-muted-foreground">Гүйцэтгэл</p>
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="px-4 mt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Гүйлгээнүүд</h3>
          <Button variant="ghost" size="sm">
            Бүгд
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === "earning"
                    ? "bg-success/10"
                    : transaction.type === "bonus"
                      ? "bg-accent/10"
                      : "bg-destructive/10"
                }`}>
                {transaction.type === "withdrawal" ? (
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                ) : (
                  <ArrowUpRight
                    className={`w-5 h-5 ${
                      transaction.type === "bonus"
                        ? "text-accent"
                        : "text-success"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.time}
                </p>
              </div>
              <span
                className={`font-bold ${
                  transaction.amount > 0 ? "text-success" : "text-destructive"
                }`}>
                {transaction.amount > 0 ? "+" : ""}₮
                {Math.abs(transaction.amount)?.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
