'use client'

import { WalletButton } from '../solana/solana-provider'
import { useAtom } from 'jotai'
import { viewModeAtom } from './dashboard-store'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'

export function Topbar() {
    const [viewMode, setViewMode] = useAtom(viewModeAtom)
    const isPrivate = viewMode === 'private'

    const toggleView = () => {
        setViewMode(isPrivate ? 'public' : 'private')
    }

    return (
        <header className={cn(
            "sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl transition-all duration-500",
            isPrivate
                ? "bg-black/40 border-primary/30"
                : "bg-background/80 border-border"
        )}>
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                    {isPrivate ? 'Command Center (Private)' : 'Public Profile (Decoy)'}
                </h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Dual Interface Toggle */}
                <button
                    onClick={toggleView}
                    className="group relative flex h-10 w-48 items-center rounded-full bg-black/20 p-1 ring-1 ring-white/10 transition-all hover:ring-white/20"
                >
                    <div className={cn(
                        "absolute h-8 w-[50%] rounded-full shadow-sm transition-all duration-300",
                        isPrivate
                            ? "left-[calc(50%-2px)] bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            : "left-1 bg-muted-foreground/20"
                    )} />

                    <div className={cn(
                        "z-10 flex w-1/2 items-center justify-center gap-2 text-xs font-medium transition-colors",
                        !isPrivate ? "text-white" : "text-muted-foreground"
                    )}>
                        <Eye className="h-3 w-3" />
                        PUBLIC
                    </div>

                    <div className={cn(
                        "z-10 flex w-1/2 items-center justify-center gap-2 text-xs font-medium transition-colors",
                        isPrivate ? "text-white" : "text-muted-foreground"
                    )}>
                        {isPrivate ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        PRIVATE
                    </div>
                </button>

                <WalletButton />
            </div>
        </header>
    )
}
