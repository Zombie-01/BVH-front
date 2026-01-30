import { motion } from "framer-motion";
import { CheckCircle, Star, MapPin, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { mockCompletedTasks } from "@/data/driverData";

export default function DriverCompleted() {
  const groupedTasks = mockCompletedTasks.reduce(
    (acc, task) => {
      const date = task.completedAt.toLocaleDateString("mn-MN");
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    },
    {} as Record<string, typeof mockCompletedTasks>,
  );

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground">
            Дууссан хүргэлтүүд
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Амжилттай хүргэсэн захиалгууд
          </p>
        </div>

        {/* Summary */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 bg-success/10 rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-success">
              {mockCompletedTasks.length}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Нийт хүргэлт</p>
          </div>
          <div className="flex-1 bg-accent/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-2xl font-bold text-foreground">4.9</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Дундаж үнэлгээ</p>
          </div>
        </div>
      </header>

      {/* Completed Tasks */}
      <section className="px-4 py-4">
        {Object.entries(groupedTasks).map(([date, tasks]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {date}
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">
                          {task.storeName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-success">
                        +₮{task.reward?.toLocaleString()}
                      </span>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < task.rating
                                ? "text-accent fill-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{task.deliveryLocation}</span>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {task.completedAt.toLocaleTimeString("mn-MN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
