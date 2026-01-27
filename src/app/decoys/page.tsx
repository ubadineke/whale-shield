'use client'

import React from 'react'
import { AppLayout } from '@/components/app-layout'
import DecoyFeature from '@/components/decoys/decoy-feature'

export default function DecoysPage() {
    return (
        <AppLayout links={[]}>
            <DecoyFeature />
        </AppLayout>
    )
}
