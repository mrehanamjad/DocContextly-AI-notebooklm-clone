import { TextSearch } from "lucide-react";

export function Logo({ size = 24, className, showName = true }: { size?: number; className?: string, showName?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TextSearch className="text-primary" size={size} />
      {showName && <span className="font-extrabold tracking-tight text-lg">DocContextly</span>}
    </div>
  );
}
