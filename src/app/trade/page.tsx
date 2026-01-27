'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/app-layout'

// Dynamically import ShieldProvider and Feature with SSR disabled
const ShieldProvider = dynamic(
    () => import('@/components/shield/shield-provider').then((mod) => mod.ShieldProvider),
    { ssr: false }
)

const TradeFeature = dynamic(
    () => import('@/components/trade/trade-feature-inner'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Loading Silent Swap Engine...</div>
            </div>
        )
    }
)

export default function TradePage() {
    return (
        <AppLayout links={[]}>
            <ShieldProvider>
                <TradeFeature />
            </ShieldProvider>
        </AppLayout>
    )
}
