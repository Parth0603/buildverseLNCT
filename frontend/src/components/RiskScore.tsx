
interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gauge' | 'bar' | 'badge';
}

export default function RiskScore({ score, size = 'md', variant = 'gauge' }: RiskScoreProps) {
  // Determine color theme based on score rules
  let color = '#16A34A'; // Green
  let textClass = 'text-success';
  let bgClass = 'bg-success-light text-success';
  let label = 'Safe';

  if (score > 30 && score <= 70) {
    color = '#F59E0B'; // Yellow
    textClass = 'text-warning';
    bgClass = 'bg-warning-light text-warning';
    label = 'Medium Risk';
  } else if (score > 70) {
    color = '#DC2626'; // Red
    textClass = 'text-danger';
    bgClass = 'bg-danger-light text-danger';
    label = 'High Risk';
  }

  // Dimension helpers for Gauge
  const dimensions = {
    sm: { radius: 24, stroke: 4, size: 60, font: 'text-xs' },
    md: { radius: 42, stroke: 7, size: 100, font: 'text-xl' },
    lg: { radius: 64, stroke: 10, size: 150, font: 'text-3xl font-extrabold' }
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const offset = circumference - (score / 100) * circumference;

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${bgClass}`}>
        {label} ({score})
      </span>
    );
  }

  if (variant === 'bar') {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">Risk Assessment</span>
          <span className={`text-sm font-bold ${textClass}`}>{label} ({score}/100)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  }

  // circular gauge render
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: dimensions.size, height: dimensions.size }}>
      <svg className="transform -rotate-90" width={dimensions.size} height={dimensions.size}>
        {/* Background track circle */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={dimensions.radius}
          className="stroke-slate-100"
          strokeWidth={dimensions.stroke}
          fill="transparent"
        />
        {/* Animated colored score circle */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={dimensions.radius}
          stroke={color}
          strokeWidth={dimensions.stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Absolute scoring overlay text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-bold font-sans ${dimensions.font}`}>{score}</span>
        {size !== 'sm' && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score</span>
        )}
      </div>
    </div>
  );
}
