import { useState } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  MapPin,
  Package,
  Clock,
  ChevronUp,
  Phone,
  MessageCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { mockDeliveryTasks, vehicleTypes } from "@/data/driverData";

export default function DriverMap() {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeTask =
    mockDeliveryTasks.find((t) => t.status === "picked_up") ||
    mockDeliveryTasks[0];
  const vehicle = vehicleTypes.find(
    (v) => v.id === activeTask?.vehicleRequired
  );

  return (
    <AppLayout>
      {/* Map Placeholder */}
      <div className="relative h-[60vh] bg-gradient-to-b from-muted to-muted/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Газрын зураг</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Mapbox интеграци хийгдэх болно
            </p>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="absolute top-safe right-4 pt-4">
          <Button variant="default" size="icon" className="shadow-lg">
            <Navigation className="w-5 h-5" />
          </Button>
        </div>

        {/* Route Info */}
        <div className="absolute top-safe left-4 pt-4">
          <div className="bg-card rounded-xl shadow-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-success-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Хүрэх хугацаа</p>
                <p className="font-bold text-foreground">
                  {activeTask?.estimatedTime} мин
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "200px" }}
        className="bg-card rounded-t-3xl -mt-6 relative z-10 shadow-elevated overflow-hidden">
        {/* Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex justify-center">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </button>

        <div className="px-4 pb-6">
          {activeTask && (
            <>
              {/* Current Task */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                  {vehicle?.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">
                    {activeTask.storeName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTask.customerName} руу хүргэх
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    ₮{activeTask.reward.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTask.distance}км
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Авах газар</p>
                    <p className="text-sm font-medium text-foreground">
                      {activeTask.pickupLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-success/10 rounded-xl border-2 border-success">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-success-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-success">Хүргэх газар</p>
                    <p className="text-sm font-medium text-foreground">
                      {activeTask.deliveryLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <Button variant="outline" size="lg" className="flex-1">
                  <Phone className="w-5 h-5" />
                  Залгах
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <MessageCircle className="w-5 h-5" />
                  Чат
                </Button>
              </div>

              <Button variant="hero" size="xl" className="w-full mt-4">
                {activeTask.status === "assigned"
                  ? "Захиалга авах"
                  : activeTask.status === "picked_up"
                  ? "Хүргэлт эхлүүлэх"
                  : "Хүргэсэн гэж тэмдэглэх"}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
