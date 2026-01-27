'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Shield, ArrowRightLeft, Users, Settings, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from './dashboard-store'

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shield Assets', href: '/shield', icon: Shield },
    { name: 'Private Trade', href: '/trade', icon: ArrowRightLeft },
    { name: 'Decoy Manager', href: '/decoys', icon: Users },
    { name: 'Activity Log', href: '/activity', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const isPrivate = useAtomValue(isPrivateViewAtom)

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen w-64 border-r transition-all duration-500",
            isPrivate
                ? "bg-black/80 border-primary/30"
                : "bg-background border-border"
        )}>
            <div className="flex h-16 items-center px-6 border-b border-white/5">
                <Shield className={cn("h-8 w-8 mr-2", isPrivate ? "text-primary animate-pulse" : "text-muted-foreground")} />
                <span className={cn(
                    "text-xl font-bold tracking-wider",
                    isPrivate ? "text-primary neon-text-primary" : "text-foreground"
                )}>
                    WHALESHIELD
                </span>
            </div>

            <div className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? (isPrivate ? "bg-primary/20 text-primary shadow-glow-box-primary" : "bg-muted text-foreground")
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {isPrivate && (
                <div className="absolute bottom-8 left-0 w-full px-4">
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                        <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            PRIVACY SHIELD ACTIVE
                        </div>
                        <p className="text-xs text-muted-foreground">Your real positions are hidden. Public view sees decoy data.</p>
                    </div>
                </div>
            )}
        </aside>
    )
}
