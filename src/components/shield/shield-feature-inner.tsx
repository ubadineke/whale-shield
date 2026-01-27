'use client'

import React, { useState } from 'react'
import { useShield } from '@/components/shield/shield-provider'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from '@/components/dashboard/dashboard-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Info, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ShieldFeatureInner() {
    const { shieldAmount, setShieldAmount, deposit, isShielding, privateBalance } = useShield()
    const isPrivate = useAtomValue(isPrivateViewAtom)
    const [splitCount, setSplitCount] = useState(3)

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className={cn("text-3xl font-bold", isPrivate ? "text-primary neon-text-primary" : "text-foreground")}>
                    Privacy Shield
                </h1>
                <p className="text-muted-foreground">
                    Move funds from your public wallet into the privacy pool. Your deposit will be mixed with others.
                </p>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Input / Config Side */}
                <div className={cn(
                    "p-8 rounded-xl border space-y-8 transition-all duration-300",
                    isPrivate ? "glass-panel border-primary/30" : "bg-card border-border"
                )}>
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Amount to Shield (SOL)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={shieldAmount || ''}
                                onChange={(e) => setShieldAmount(parseFloat(e.target.value) || 0)}
                                className={cn(
                                    "text-2xl h-16 pl-4 pr-12 font-mono",
                                    isPrivate ? "bg-black/40 border-primary/30 focus-visible:ring-primary" : ""
                                )}
                                placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">SOL</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>Available Public: 425.50 SOL (Mock)</span>
                            <span className="text-primary cursor-pointer hover:underline">Max</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Split Strategy</Label>
                            <span className="text-xs bg-muted px-2 py-1 rounded">Recommended</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Deposit Count</span>
                                <span className="font-mono">{splitCount}x Transactions</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={splitCount}
                                onChange={(e) => setSplitCount(parseInt(e.target.value))}
                                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                                Splitting your deposit into {splitCount} random amounts makes it harder to correlate with your withdrawal later.
                            </p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className={cn(
                            "w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]",
                            isPrivate ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-box-primary" : ""
                        )}
                        onClick={deposit}
                        disabled={isShielding || shieldAmount <= 0}
                    >
                        {isShielding ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Shielding...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Shield Funds
                            </>
                        )}
                    </Button>
                </div>

                {/* Info / Status Side */}
                <div className="space-y-6">
                    {/* Privacy Balance Card */}
                    <div className={cn(
                        "p-6 rounded-xl border flex flex-col justify-center items-center h-48 relative overflow-hidden",
                        isPrivate ? "glass-panel border-green-500/30" : "bg-card border-border"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
                        <ShieldCheck className={cn("h-12 w-12 mb-4", isPrivate ? "text-green-400" : "text-muted-foreground")} />
                        <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Shielded Balance</div>
                        <div className="text-4xl font-mono font-bold mt-2">
                            {isPrivate ? `${privateBalance.toFixed(4)} SOL` : "HIDDEN"}
                        </div>
                    </div>

                    {/* Explainer */}
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-primary" />
                            How it works
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                Your SOL is deposited into a smart contract pool.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                You receive a cryptographic "Note" (stored locally) that proves ownership.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                When swapping or withdrawing, ZK-Snarks prove you own funds without revealing <i>which</i> deposit was yours.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
