'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/app-layout'

// Dynamically import ShieldProvider and Feature with SSR disabled
const ShieldProvider = dynamic(
    () => import('@/components/shield/shield-provider').then((mod) => mod.ShieldProvider),
    { ssr: false }
)

const ShieldFeature = dynamic(
    () => import('@/components/shield/shield-feature-inner'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Loading Privacy Shield...</div>
            </div>
        )
    }
)

export default function ShieldPage() {
    return (
        <AppLayout links={[]}>
            <ShieldProvider>
                <ShieldFeature />
            </ShieldProvider>
        </AppLayout>
    )
}
