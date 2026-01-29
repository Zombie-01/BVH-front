import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MessageCircle, Award, CheckCircle, Calendar, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { mockServiceWorkers } from '@/data/mockData';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [expectedBudget, setExpectedBudget] = useState('');
  
  const worker = mockServiceWorkers.find(w => w.id === id);
  
  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Мэргэжилтэн олдсонгүй</p>
      </div>
    );
  }

  const handleStartChat = () => {
    const budget = parseInt(expectedBudget) || worker.hourlyRate * 3;
    navigate(`/chat/new-worker-${worker.id}`, {
      state: {
        type: 'service',
        name: worker.name,
        workerId: worker.id,
        serviceDescription: jobDescription || `${worker.specialty} ажил`,
        expectedPrice: budget,
      }
    });
  };

  // Mock reviews
  const reviews = [
    { id: '1', userName: 'Болд Б.', rating: 5, comment: 'Маш сайн ажилласан, цаг баримталсан.', date: '2024-01-10' },
    { id: '2', userName: 'Сүхбат Г.', rating: 5, comment: 'Чанартай, үнэ боломжийн.', date: '2024-01-08' },
    { id: '3', userName: 'Батбаяр Н.', rating: 4, comment: 'Сайн ажил хийсэн.', date: '2024-01-05' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Worker Profile */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 pt-4 pb-8 lg:rounded-2xl lg:mt-6 lg:mx-6">
              <div className="px-4 lg:px-6">
                {/* Back Button */}
                <button 
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg mb-4"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                
                {/* Profile */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center md:flex-row md:items-start md:gap-6"
                >
                  <div className="relative">
                    <img 
                      src={worker.avatar} 
                      alt={worker.name}
                      className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-card shadow-lg"
                    />
                    {worker.isAvailable && (
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="text-center md:text-left mt-4 md:mt-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{worker.name}</h1>
                    <p className="text-muted-foreground">{worker.specialty}</p>
                    
                    <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-lg">{worker.rating}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>{worker.completedJobs} ажил</span>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      {worker.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          <Award className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="px-4 lg:px-6 -mt-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">{worker.hourlyRate.toLocaleString()}₮</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Цагийн үнэ</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{worker.completedJobs}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Дууссан ажил</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{worker.rating}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Үнэлгээ</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Description */}
            {worker.description && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="px-4 lg:px-6 mt-4"
              >
                <h2 className="font-bold text-foreground mb-2">Танилцуулга</h2>
                <p className="text-muted-foreground text-sm md:text-base">{worker.description}</p>
              </motion.div>
            )}
            
            {/* Quick Actions */}
            <div className="px-4 lg:px-6 mt-4">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Залгах
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Цаг товлох
                </Button>
              </div>
            </div>

            {/* Reviews */}
            <div className="px-4 lg:px-6 mt-6">
              <h2 className="text-lg font-bold text-foreground mb-3">Сэтгэгдлүүд</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-card rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{review.userName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Request Service (Desktop) */}
          <div className="lg:col-span-1 px-4 lg:px-0 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-6 lg:mr-6 lg:mt-6">
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-lg">
                <h2 className="text-lg font-bold text-foreground mb-3">Үйлчилгээ захиалах</h2>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="Хийлгэх ажлын тайлбар бичнэ үү... (Жишээ: 2 өрөө байрны цахилгааны утас солих)"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Input
                    type="number"
                    placeholder="Төсөв (₮)"
                    value={expectedBudget}
                    onChange={(e) => setExpectedBudget(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!jobDescription.trim() || !worker.isAvailable}
                    onClick={handleStartChat}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {worker.isAvailable ? 'Чат эхлүүлэх' : 'Одоогоор завгүй байна'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
