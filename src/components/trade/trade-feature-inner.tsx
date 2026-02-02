'use client'

import React, { useState } from 'react'
import { useShield } from '@/components/shield/shield-provider'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from '@/components/dashboard/dashboard-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown, RefreshCw, Loader2, ArrowRightLeft, Shield, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TradeEngine, TradeProgress } from '@/lib/trade/engine'
import { useConnection } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

const TOKENS = [
    { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
    { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
]

export default function TradeFeatureInner() {
    const { sdk, privateBalance } = useShield()
    const { connection } = useConnection()
    const isPrivate = useAtomValue(isPrivateViewAtom)

    const [inputToken, setInputToken] = useState(TOKENS[0])
    const [outputToken, setOutputToken] = useState(TOKENS[1])
    const [amount, setAmount] = useState<string>('')

    const [isTrading, setIsTrading] = useState(false)
    const [progress, setProgress] = useState<TradeProgress | null>(null)

    const handleSwap = async () => {
        if (!sdk || !connection) return
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        try {
            setIsTrading(true)
            const engine = new TradeEngine(sdk, connection)

            const amountLamports = parseFloat(amount) * (10 ** inputToken.decimals)

            await engine.executePrivateSwap(
                inputToken.mint,
                outputToken.mint,
                amountLamports,
                (p) => {
                    console.log('Progress:', p)
                    setProgress(p)
                }
            )

            toast.success("Private swap completed successfully!")
            setAmount('')
        } catch (e: any) {
            console.error("Trade feature error:", e)
            toast.error(`Trade failed: ${e.message}`)
        } finally {
            setIsTrading(false)
            setProgress(null)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Warning Alert */}
            {!isPrivate && (
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-amber-500">Public View Warning</p>
                        <p className="text-muted-foreground">You are currently in Public View. Private trades can only be initiated from the Private Dashboard for security.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className={cn("text-3xl font-bold", isPrivate ? "text-primary neon-text-primary" : "text-foreground")}>
                    Silent Swap
                </h1>
                <p className="text-muted-foreground">
                    Execute trades via temporary ephemeral wallets to break the link between your identity and your activity.
                </p>
            </div>

            {/* Swap Card */}
            <div className={cn(
                "p-6 rounded-2xl border space-y-4 transition-all duration-500",
                isPrivate ? "glass-panel border-primary/30 shadow-glow-box-primary" : "bg-card border-border opacity-50 pointer-events-none"
            )}>
                {/* From Section */}
                <div className="bg-black/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>From (Shielded)</span>
                        <span>Balance: {privateBalance.toFixed(4)} {inputToken.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Input
                            type="text"
                            value={amount}
                            onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setAmount(val)
                                }
                            }}
                            className="bg-transparent border-none text-2xl font-mono focus-visible:ring-0 p-0"
                            placeholder="0.00"
                        />
                        <div className="bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold cursor-pointer hover:bg-muted/80">
                            <span className="text-lg">{inputToken.symbol}</span>
                        </div>
                    </div>
                </div>

                {/* Arrow Spacer */}
                <div className="flex justify-center -my-6 relative z-10">
                    <div className="bg-primary p-2 rounded-full border-4 border-[#0a0a0a] cursor-pointer hover:scale-110 transition-transform">
                        <ArrowDown className="text-primary-foreground h-5 w-5" />
                    </div>
                </div>

                {/* To Section */}
                <div className="bg-black/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>To (Shielded)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-mono flex-1 text-muted-foreground">
                            0.00
                        </div>
                        <div className="bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold cursor-pointer hover:bg-muted/80">
                            <span className="text-lg">{outputToken.symbol}</span>
                        </div>
                    </div>
                </div>

                {/* Status indicator for steps */}
                {isTrading && progress && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary">Executing Stealth Flow</span>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000"
                                    style={{
                                        width: `${progress.step === 'INITIALIZING' ? 10 :
                                            progress.step === 'WITHDRAWING_FROM_POOL' ? 30 :
                                                progress.step === 'WAITING_FOR_FUNDS' ? 50 :
                                                    progress.step === 'SWAPPING_ON_JUPITER' ? 75 :
                                                        progress.step === 'SHIELDING_RESULTS' ? 90 : 100
                                            }%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground italic text-center">
                                {progress.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={handleSwap}
                    disabled={!isPrivate || isTrading || !amount}
                    className={cn(
                        "w-full h-14 text-xl font-bold rounded-xl transition-all",
                        isPrivate ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-box-primary" : "bg-muted text-muted-foreground"
                    )}
                >
                    {isTrading ? (
                        <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                            SWAPPING SILENTLY...
                        </>
                    ) : (
                        <>
                            <ArrowRightLeft className="mr-2 h-5 w-5" />
                            EXECUTE SILENT SWAP
                        </>
                    )}
                </Button>

                <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
                    <Shield className="h-3 w-3" />
                    End-to-End Encrypted Strategy
                </div>
            </div>

            {/* Strategy Info Box */}
            <div className="glass-panel rounded-2xl p-6 border-white/5 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Shield className="text-primary h-5 w-5" />
                    Stealth Execution Path
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Privacy Exit', desc: 'SDK withdraws to fresh ephemeral wallet' },
                        { title: 'Atomic Swap', desc: 'Jupiter executes swap via ephemeral wallet' },
                        { title: 'Privacy Entry', desc: 'Resulting tokens are instantly re-shielded' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                            <div className="text-primary font-bold text-xs mb-1 uppercase">{item.title}</div>
                            <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
