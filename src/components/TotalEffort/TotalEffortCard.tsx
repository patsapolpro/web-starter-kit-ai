interface TotalEffortCardProps {
  totalEffort: number;
  visible: boolean;
}

export function TotalEffortCard({ totalEffort, visible }: TotalEffortCardProps) {
  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl px-10 py-8 shadow-xl text-center text-white mb-5">
      <div className="text-base opacity-90 font-medium mb-2">Total Active Effort</div>
      <div className="text-5xl font-bold">{totalEffort.toFixed(2)}</div>
    </div>
  );
}
