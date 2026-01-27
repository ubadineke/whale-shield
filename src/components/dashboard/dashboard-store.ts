import { atom } from 'jotai'

export type ViewMode = 'public' | 'private'

export const viewModeAtom = atom<ViewMode>('public')

// Derived atom to check if we are in private mode (Whale view)
export const isPrivateViewAtom = atom((get) => get(viewModeAtom) === 'private')
