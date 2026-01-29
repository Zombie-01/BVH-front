import { cn } from '@/lib/utils';

interface CategoryPillProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryPill({ label, icon, isActive = false, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 touch-feedback",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card text-foreground shadow-card hover:shadow-md border border-border"
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
