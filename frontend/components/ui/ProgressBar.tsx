import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="mt-1 text-sm text-gray-600">{percentage.toFixed(1)}%</p>
      )}
    </div>
  );
}
