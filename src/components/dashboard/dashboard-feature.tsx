'use client'

import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from './dashboard-store'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck, Activity, LineChart } from 'lucide-react'
import { useState, useEffect } from 'react'

export function DashboardFeature() {
  const isPrivate = useAtomValue(isPrivateViewAtom)
  const [privateBalance, setPrivateBalance] = useState<number>(0)

  // Note: Real balance will be fetched via ShieldProvider context when available client-side
  // For now, we use a placeholder. The useShield hook cannot be imported here due to WASM/SSR issues.

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className={cn("text-3xl font-bold", isPrivate ? "text-primary neon-text-primary" : "text-foreground")}>
          {isPrivate ? "Whale Overview" : "Wallet Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {isPrivate
            ? "Your true positions are encrypted and hidden from the public."
            : "This is how your wallet appears to on-chain observers."}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className={cn(
          "p-6 rounded-xl border transition-all duration-300",
          isPrivate ? "glass-panel border-primary/40 shadow-glow-box-primary" : "bg-card border-border"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
            {isPrivate ? <ShieldCheck className="text-primary h-5 w-5" /> : <Wallet className="text-muted-foreground h-5 w-5" />}
          </div>
          <div className="text-3xl font-bold font-mono">
            {isPrivate ? `${privateBalance.toFixed(4)} SOL` : "$425.50"}
          </div>
          <div className={cn("text-sm mt-1", isPrivate ? "text-green-400" : "text-red-400")}>
            {isPrivate ? "+$150,000 (24h)" : "-$12.30 (24h)"}
          </div>
        </div>

        {/* P&L / Activity Card */}
        <div className={cn(
          "p-6 rounded-xl border transition-all duration-300",
          isPrivate ? "glass-panel border-primary/20" : "bg-card border-border"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isPrivate ? "Real P&L" : "Recent Activity"}
            </h3>
            <LineChart className="text-muted-foreground h-5 w-5" />
          </div>
          {isPrivate ? (
            <div>
              <div className="text-3xl font-bold font-mono text-green-500">+$854,200</div>
              <p className="text-xs text-muted-foreground mt-2">All-time Privacy Cash gains</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Swapped SOL</span>
                <span className="text-red-400">-$25.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Briefly held BONK</span>
                <span className="text-green-400">+$2.50</span>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Score / Bot Score */}
        <div className={cn(
          "p-6 rounded-xl border transition-all duration-300",
          isPrivate ? "glass-panel border-primary/20" : "bg-card border-border"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isPrivate ? "Anonymity Set" : "Bot Appearance Score"}
            </h3>
            <Activity className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="text-3xl font-bold font-mono">
            {isPrivate ? "Strong" : "98/100"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isPrivate ? "Your mix is indistinguishable." : "You look like a typical retail trader."}
          </div>
        </div>
      </div>

      {/* Transaction List Placeholder */}
      <div className={cn(
        "rounded-xl border p-6 min-h-[300px]",
        isPrivate ? "glass-panel border-white/10" : "bg-card border-border"
      )}>
        <h3 className="text-lg font-semibold mb-6">
          {isPrivate ? "Encrypted Shield Notes" : "Public Transaction History"}
        </h3>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-full", isPrivate ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                  {isPrivate ? <ShieldCheck size={18} /> : (i % 2 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />)}
                </div>
                <div>
                  <div className="font-medium">
                    {isPrivate ? `Shielded Note #${1024 + i}` : (i % 2 ? "Swap USDC -> SOL" : "Swap SOL -> BONK")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isPrivate ? "0x...encrypted" : "Just now"}
                  </div>
                </div>
              </div>
              <div className="font-mono">
                {isPrivate ? "1,000.00 USDC" : (i % 2 ? "-50.00 USDC" : "+0.45 SOL")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
