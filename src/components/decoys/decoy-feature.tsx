'use client'

import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from '@/components/dashboard/dashboard-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, Users, Ghost, Zap, AlertCircle, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const DECOY_TEMPLATES = [
    { name: 'Paperhands Simulator', desc: 'Sells small amounts of meme tokens at a loss.', cost: '0.05 SOL' },
    { name: 'Airdrop Hunter', desc: 'Interact with new, low-volume protocols.', cost: '0.01 SOL' },
    { name: 'FOMO Bot', desc: 'Buys 10 different tokens in 5 minutes.', cost: '0.25 SOL' },
]

export default function DecoyFeature() {
    const isPrivate = useAtomValue(isPrivateViewAtom)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => {
            setIsGenerating(false)
            toast.success("Decoy batch prepared. Ready for execution.")
        }, 2000)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className={cn("text-3xl font-bold", isPrivate ? "text-primary neon-text-primary" : "text-foreground")}>
                    Decoy Manager
                </h1>
                <p className="text-muted-foreground">
                    Generate noise in your public wallet to mask your identity and look like a regular retail user.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DECOY_TEMPLATES.map((t, i) => (
                    <div key={i} className={cn(
                        "p-6 rounded-xl border flex flex-col gap-4 transform transition-all hover:scale-[1.03]",
                        isPrivate ? "glass-panel border-white/10" : "bg-card border-border opacity-50"
                    )}>
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            {i === 0 ? <Ghost /> : i === 1 ? <Users /> : <Zap />}
                        </div>
                        <div>
                            <h3 className="font-bold">{t.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                        </div>
                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                            <span className="text-sm font-mono">{t.cost}</span>
                            <Button size="sm" variant="outline" className="text-xs h-7">Preview</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cn(
                "p-8 rounded-2xl border flex flex-col items-center text-center space-y-6 transition-all",
                isPrivate ? "glass-panel border-primary/20" : "bg-card border-border"
            )}>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <Users className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                    <h2 className="text-xl font-bold mb-2">Initialize Global Decoy Layer</h2>
                    <p className="text-sm text-muted-foreground">
                        By enabling this, WhaleShield will automatically propose a batch of transactions weekly that align with "retail" behavior patterns.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        className={cn(isPrivate ? "bg-primary text-primary-foreground shadow-glow-box-primary" : "")}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Simulating Noise..." : "Generate Decoy Batch"}
                    </Button>
                    <Button size="lg" variant="outline">Schedule Decoy Bot</Button>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex gap-4 items-start">
                <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <div className="text-sm">
                    <p className="font-bold text-blue-500">How Decoys Protect You</p>
                    <p className="text-muted-foreground mt-1 leading-relaxed">
                        Whale-watching tools look for "clean" wallets with high-value transactions. By introducing "clutter" (dust amounts, meme token trades, interaction with common dApps), you dilute your profile's signal, making it indistinguishable from automated bots or casual users.
                    </p>
                </div>
            </div>
        </div>
    )
}
