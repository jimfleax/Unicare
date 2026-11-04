import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal"

export default function TerminalDemo() {
  return (
    <div className="w-full py-6">
      <Terminal>
        <TypingAnimation>&gt; unicare telemetry scan --detect-patterns</TypingAnimation>
        <AnimatedSpan className="text-emerald-400">
          <span>✔ [INIT] Connected to campus telemetry clusters across 12 zones.</span>
        </AnimatedSpan>
        <AnimatedSpan className="text-amber-400">
          <span>▲ [ANOMALY] Cluster #ANM-8821: Repeated thermal spikes in Block-C Server-UPS.</span>
        </AnimatedSpan>
        <AnimatedSpan className="text-zinc-400">
          <span>✔ Phase 01 Complete: 1 high-probability failure pattern detected.</span>
        </AnimatedSpan>
      </Terminal>
    </div>
  )
}
