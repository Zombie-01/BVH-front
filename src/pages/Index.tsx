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
    <div
      className="
  relative overflow-hidden flex flex-col
  h-dvh md:min-h-screen
  bg-background
">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute md:hidden bottom-40 left-4 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="px-6 pt-6 lg:px-16 flex justify-between items-center">
        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full">
          <img src="/logo.png" alt="logo" />
        </div>

        <div className="hidden md:flex gap-8 text-sm text-muted-foreground">
          <span>Барилга</span>
          <span>Үйлчилгээ</span>
          <span>Хүргэлт</span>
        </div>
      </header>

      {/* Content */}
      <div className="md:flex-1 flex flex-col h-full lg:flex-row items-center justify-between px-6 lg:px-16 pt-4 gap-4 md:gap-10 max-h-[75vh]">
        {/* LEFT SIDE */}
        <div className="md:flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">
              Барилга
              <br />
              <span>Үйлчилгээ</span>
              <br />
              <span className="text-accent">Хүргэлт</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Барилгын материал, хүргэлт, мэргэжлийн үйлчилгээг нэг дороос
            хялбархан захиалаарай.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 md:mt-8 grid grid-cols-3 gap-4">
            {features.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col items-center justify-center aspect-square shadow-card">
                <item.icon className="w-6 h-6 mb-2" />
                <span className="text-xs md:text-sm font-medium">
                  {item.label}
                </span>
                <span className="text-[10px] md:text-xs opacity-70 mt-0.5">
                  {item.desc}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Desktop */}
          <div className="hidden lg:block mt-10">
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-medium"
              onClick={() => navigate("/auth")}>
              Эхлэх
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className=" max-w-4xl w-full h-full">
          <div className="bg-card rounded-3xl overflow-hidden shadow-elevated h-full lg:aspect-[5/4]">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-7xl md:text-8xl">🏠</span>
                <p className="mt-3 text-sm text-muted-foreground">Таны төсөл</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 lg:hidden">
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl text-base font-medium"
          onClick={() => navigate("/auth")}>
          Эхлэх
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;
