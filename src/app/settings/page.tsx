'use client'

import React from 'react'
import { AppLayout } from '@/components/app-layout'
import { Settings, Save, Lock, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
    return (
        <AppLayout links={[]}>
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Settings
                </h1>

                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl border-white/5 space-y-4">
                        <h3 className="font-bold border-b border-white/5 pb-2">Privacy Identity</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">Session Notes Backup</p>
                                <p className="text-xs text-muted-foreground">Download your local note cache in case you clear your browser data.</p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export Notes
                            </Button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl border-white/5 space-y-4">
                        <h3 className="font-bold border-b border-white/5 pb-2 text-red-500">Security</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">Reset Privacy Wallet</p>
                                <p className="text-xs text-muted-foreground">This will wipe your session key and local note pointers. **Irreversible**.</p>
                            </div>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Cache
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
