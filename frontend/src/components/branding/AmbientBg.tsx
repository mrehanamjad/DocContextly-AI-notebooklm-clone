export function AmbientBg() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none" aria-hidden>
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary/10 blur-[120px] animate-aura" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent-blue/10 blur-[120px] animate-aura" />
      <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] rounded-full bg-accent-pink/10 blur-[100px] animate-aura" />
    </div>
  );
}
