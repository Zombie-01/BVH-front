import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, Truck, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Package, label: "Материал", desc: "Бүх төрлийн" },
    { icon: Truck, label: "Хүргэлт", desc: "Шуурхай" },
    { icon: Wrench, label: "Мэргэжилтэн", desc: "Итгэлтэй" },
  ];

  return (
    <div className="h-screen w-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-4 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="w-10 h-1 bg-foreground/20 rounded-full" />
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-lg">🏗️</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
            Барилгын
            <br />
            <span className="text-foreground">Төгс Шийдэл</span>
            <br />
            <span className="text-accent">танд</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-muted-foreground text-base max-w-xs leading-relaxed">
          Барилгын материал, хүргэлт, мэргэжлийн үйлчилгээг нэг дороос хялбархан
          захиалаарай
        </motion.p>

        {/* Image Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 relative">
          <div className="bg-card rounded-3xl overflow-hidden shadow-elevated w-full max-w-md mx-auto aspect-[4/3]">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl">🏠</span>
                <p className="mt-2 text-sm text-muted-foreground">Таны төсөл</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col items-center justify-center aspect-square shadow-card">
              <item.icon className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">{item.label}</span>
              <span className="text-2xs opacity-70 mt-0.5">{item.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 pb-safe  mt-auto">
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          onClick={() => navigate("/role-selection")}
          style={{ position: "relative", zIndex: 1000 }}>
          Эхлэх
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Үргэлжлүүлснээр та үйлчилгээний нөхцөлийг зөвшөөрч байна
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
