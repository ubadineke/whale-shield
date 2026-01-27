'use client'

import { Toaster } from '@/components/ui/sonner'
import React from 'react'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'
import { Sidebar } from './dashboard/sidebar'
import { Topbar } from './dashboard/topbar'
import { useAtomValue } from 'jotai'
import { isPrivateViewAtom } from './dashboard/dashboard-store'
import { cn } from '@/lib/utils'

export function AppLayout({
  children,
  links, // Keeping links prop for compatibility but ignoring it for now as Sidebar defines its own
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  const isPrivate = useAtomValue(isPrivateViewAtom)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 transition-all duration-300">
        <Topbar />

        <main className={cn(
          "container mx-auto p-8 min-h-[calc(100vh-4rem)] transition-colors duration-500",
          isPrivate && "bg-black/20"
        )}>
          <ClusterChecker>
            <AccountChecker />
          </ClusterChecker>

          <div className="animate-in fade-in zoom-in-95 duration-500">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" theme={isPrivate ? 'dark' : 'system'} />
    </div>
  )
}
