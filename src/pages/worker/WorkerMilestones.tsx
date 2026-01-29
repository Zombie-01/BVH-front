import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Camera, 
  Upload,
  MapPin,
  Clock,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  photoRequired: boolean;
  photoUrl?: string;
  completedAt?: Date;
}

interface ActiveJob {
  id: string;
  title: string;
  customerName: string;
  customerAvatar: string;
  location: string;
  totalPrice: number;
  milestones: Milestone[];
  startedAt: Date;
}

const mockActiveJobs: ActiveJob[] = [
  {
    id: '1',
    title: 'Байшингийн утас шинэчлэх',
    customerName: 'Энхбаяр Г.',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    location: 'Сүхбаатар дүүрэг, 1-р хороо',
    totalPrice: 450000,
    startedAt: new Date('2024-01-17'),
    milestones: [
      {
        id: '1',
        title: 'Хуучин утас салгах',
        description: 'Бүх өрөөний хуучин цахилгааны утас салгах',
        completed: true,
        photoRequired: true,
        photoUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
        completedAt: new Date('2024-01-17'),
      },
      {
        id: '2',
        title: 'Шинэ утас татах',
        description: 'Шинэ кабель татаж хананд бэхлэх',
        completed: true,
        photoRequired: true,
        photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        completedAt: new Date('2024-01-18'),
      },
      {
        id: '3',
        title: 'Залгуур, унтраалга суурилуулах',
        description: 'Бүх залгуур, унтраалга холбож суурилуулах',
        completed: false,
        photoRequired: true,
      },
      {
        id: '4',
        title: 'Туршилт хийх',
        description: 'Бүх цахилгааныг туршиж, аюулгүй ажиллагааг шалгах',
        completed: false,
        photoRequired: false,
      },
    ],
  },
  {
    id: '2',
    title: 'LED гэрэлтүүлэг суурилуулах',
    customerName: 'Мөнхжин С.',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    location: 'Чингэлтэй дүүрэг, 7-р хороо',
    totalPrice: 100000,
    startedAt: new Date('2024-01-18'),
    milestones: [
      {
        id: '1',
        title: 'Байршил тодорхойлох',
        description: 'LED гэрлийн байршлыг тэмдэглэх',
        completed: true,
        photoRequired: false,
        completedAt: new Date('2024-01-18'),
      },
      {
        id: '2',
        title: 'Суурилуулах',
        description: 'LED гэрлийг суурилуулах',
        completed: false,
        photoRequired: true,
      },
    ],
  },
];

export default function WorkerMilestones() {
  const [selectedJob, setSelectedJob] = useState<string>(mockActiveJobs[0]?.id || '');

  const currentJob = mockActiveJobs.find(j => j.id === selectedJob);

  if (!currentJob) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Идэвхтэй ажил байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор явагдаж буй ажил байхгүй байна
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const completedCount = currentJob.milestones.filter(m => m.completed).length;
  const progress = (completedCount / currentJob.milestones.length) * 100;

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Үе шатууд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ажлын явцыг бүртгэх
          </p>
        </div>
      </header>

      {/* Job Selector */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {mockActiveJobs.map(job => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors",
                selectedJob === job.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <img
                src={job.customerAvatar}
                alt={job.customerName}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium">{job.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Job Details */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-start gap-4">
            <img
              src={currentJob.customerAvatar}
              alt={currentJob.customerName}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{currentJob.title}</h3>
              <p className="text-sm text-muted-foreground">{currentJob.customerName}</p>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">{currentJob.location}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-primary">
                ₮{currentJob.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Явц</span>
              <span className="font-medium">{completedCount}/{currentJob.milestones.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="px-4 py-6 max-w-7xl mx-auto">
        <h2 className="font-bold text-foreground mb-4">Үе шатууд</h2>
        <div className="space-y-4">
          {currentJob.milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                "bg-card rounded-2xl p-4 shadow-card border-l-4 transition-colors",
                milestone.completed 
                  ? "border-l-success" 
                  : "border-l-muted"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  milestone.completed ? "bg-success" : "bg-muted"
                )}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-success-foreground" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                    {milestone.photoRequired && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Camera className="w-3 h-3" />
                        Зураг
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>

                  {/* Completed Photo */}
                  {milestone.photoUrl && (
                    <div className="mt-3">
                      <img
                        src={milestone.photoUrl}
                        alt="Баталгаажуулах зураг"
                        className="w-full max-w-xs h-32 rounded-xl object-cover"
                      />
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {milestone.completedAt && new Date(milestone.completedAt).toLocaleString('mn-MN')}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {!milestone.completed && (
                    <div className="mt-3 flex gap-2">
                      {milestone.photoRequired ? (
                        <Button size="sm" className="gap-2">
                          <Camera className="w-4 h-4" />
                          Зураг оруулах
                        </Button>
                      ) : (
                        <Button size="sm">
                          Дууссан гэж тэмдэглэх
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
