'use client'

import React from 'react'
import { AppLayout } from '@/components/app-layout'
import { Activity } from 'lucide-react'

export default function ActivityPage() {
    return (
        <AppLayout links={[]}>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <Activity className="h-12 w-12 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold">Activity Log</h1>
                <p className="text-muted-foreground max-w-md">
                    This log tracks your shielded interactions. Historical notes and transactions will appear here as you interact with the Privacy Pool.
                </p>
            </div>
        </AppLayout>
    )
}
