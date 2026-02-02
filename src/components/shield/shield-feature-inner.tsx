'use client'

import React, { useState } from 'react'
import { useShield } from '@/components/shield/shield-provider'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from '@/components/dashboard/dashboard-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Info, ArrowRight, Loader2, Landmark, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ShieldFeatureInner() {
    const {
        shieldAmount, setShieldAmount, deposit, isShielding,
        privateBalance, unshieldAmount, setUnshieldAmount, withdraw, isWithdrawing
    } = useShield()

    const [mode, setMode] = useState<'shield' | 'unshield'>('shield')
    const [shieldInput, setShieldInput] = useState(shieldAmount?.toString() || '')
    const [unshieldInput, setUnshieldInput] = useState(unshieldAmount?.toString() || '')

    const isPrivate = useAtomValue(isPrivateViewAtom)
    const [splitCount, setSplitCount] = useState(3)

    const handleShieldChange = (val: string) => {
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setShieldInput(val)
            const numericValue = parseFloat(val)
            setShieldAmount(isNaN(numericValue) ? 0 : numericValue)
        }
    }

    const handleUnshieldChange = (val: string) => {
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setUnshieldInput(val)
            const numericValue = parseFloat(val)
            setUnshieldAmount(isNaN(numericValue) ? 0 : numericValue)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className={cn("text-4xl font-extrabold tracking-tight", isPrivate ? "text-primary neon-text-primary" : "text-foreground")}>
                    {mode === 'shield' ? "Privacy Shield" : "Unshield Funds"}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {mode === 'shield'
                        ? "Move funds from your public wallet into the privacy pool. Your deposit will be mixed with others."
                        : "Withdraw your shielded SOL back to your public wallet or any other address anonymously."}
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setMode('shield')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                        mode === 'shield' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Shield (Deposit)
                </button>
                <button
                    onClick={() => setMode('unshield')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                        mode === 'unshield' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Unshield (Withdraw)
                </button>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
                {/* Input / Config Side */}
                <div className={cn(
                    "p-8 rounded-2xl border space-y-8 transition-all duration-300 relative overflow-hidden",
                    isPrivate ? "glass-panel border-primary/30 shadow-glow-box-primary/10" : "bg-card border-border shadow-xl"
                )}>
                    {mode === 'shield' ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Amount to Shield (SOL)</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={shieldInput}
                                        onChange={(e) => handleShieldChange(e.target.value)}
                                        className={cn(
                                            "text-3xl h-20 pl-4 pr-16 font-mono font-bold tracking-tighter",
                                            isPrivate ? "bg-black/40 border-primary/30 focus-visible:ring-primary h-20" : "h-20"
                                        )}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl">SOL</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Available Public: 425.50 SOL (Mock)</span>
                                    <span className="text-primary cursor-pointer hover:underline font-semibold">Max</span>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Anonymity Strategy</Label>
                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">High Security</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Transaction Splits</span>
                                        <span className="font-mono font-bold text-primary">{splitCount}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={splitCount}
                                        onChange={(e) => setSplitCount(parseInt(e.target.value))}
                                        className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                        Your deposit will be split into {splitCount} distinct transactions to break the deterministic link.
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className={cn(
                                    "w-full h-16 text-xl font-black uppercase tracking-tighter shadow-2xl transition-all active:scale-95 group",
                                    isPrivate ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-box-primary" : ""
                                )}
                                onClick={deposit}
                                disabled={isShielding || shieldAmount <= 0}
                            >
                                {isShielding ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Shielding...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" />
                                        Shield Funds
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-base font-semibold text-primary">Unshield Amount (SOL)</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={unshieldInput}
                                        onChange={(e) => handleUnshieldChange(e.target.value)}
                                        className={cn(
                                            "text-3xl h-20 pl-4 pr-16 font-mono font-bold tracking-tighter bg-black/40 border-primary/30 focus-visible:ring-primary",
                                            ""
                                        )}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl">SOL</span>
                                </div>
                                <div className="flex justify-between text-xs px-1">
                                    <span className="text-muted-foreground">Shielded Balance: {privateBalance.toFixed(4)} SOL</span>
                                    <span
                                        onClick={() => {
                                            setUnshieldInput(privateBalance.toString())
                                            setUnshieldAmount(privateBalance)
                                        }}
                                        className="text-primary cursor-pointer hover:underline font-semibold"
                                    >
                                        Use Max
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Relayer Fee (Flat)</span>
                                    <span className="font-mono">~0.006 SOL</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Service Fee</span>
                                    <span className="font-mono">0.35%</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className={cn(
                                    "w-full h-16 text-xl font-black uppercase tracking-tighter shadow-2xl transition-all active:scale-95 group",
                                    "bg-white text-black hover:bg-white/90 shadow-white/10"
                                )}
                                onClick={withdraw}
                                disabled={isWithdrawing || unshieldAmount <= 0}
                            >
                                {isWithdrawing ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-3 h-6 w-6 transition-transform group-hover:rotate-180 duration-500" />
                                        Withdraw SOL
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Info / Status Side */}
                <div className="space-y-6">
                    {/* Privacy Balance Card */}
                    <div className={cn(
                        "p-6 rounded-2xl border flex flex-col justify-center items-center h-56 relative overflow-hidden group transition-all",
                        isPrivate ? "glass-panel border-green-500/40 shadow-glow-box-primary/5" : "bg-card border-border shadow-lg"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity" />
                        <ShieldCheck className={cn("h-16 w-16 mb-4 transition-transform group-hover:scale-110", isPrivate ? "text-green-400" : "text-muted-foreground")} />
                        <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">Shielded Holdings</div>
                        <div className="text-4xl font-mono font-bold mt-3 tracking-tighter flex items-end gap-1">
                            {isPrivate ? (
                                <>
                                    <span>{privateBalance.toFixed(4)}</span>
                                    <span className="text-lg text-muted-foreground mb-1">SOL</span>
                                </>
                            ) : "••••••••"}
                        </div>
                    </div>

                    {/* Explainer */}
                    <div className="bg-muted/30 rounded-2xl p-8 border border-border/50 space-y-6">
                        <h3 className="font-bold text-lg flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Info className="h-5 w-5" />
                            </div>
                            Protocol Insight
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { title: "Non-Custodial", desc: "WhaleShield never holds your keys. You own the cryptographic notes." },
                                { title: "ZK-Proof Verification", desc: "Withdrawals are verified via zero-knowledge proofs on-chain." },
                                { title: "Network Neutral", desc: "Your unshielding can be sent to standard wallets or fresh burners." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div>
                                        <div className="font-bold text-sm text-foreground">{item.title}</div>
                                        <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
