'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { PrivacyCash } from 'privacycash'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { Keypair } from '@solana/web3.js'
import { VersionedTransaction } from '@solana/web3.js'

// --- Types ---
interface ShieldContextType {
    sdk: PrivacyCash | null
    isShielding: boolean
    isWithdrawing: boolean
    shieldAmount: number
    unshieldAmount: number
    setShieldAmount: (amount: number) => void
    setUnshieldAmount: (amount: number) => void
    deposit: () => Promise<void>
    withdraw: () => Promise<void>
    refreshBalance: () => Promise<void>
    privateBalance: number // in SOL
}

const ShieldContext = createContext<ShieldContextType>({
    sdk: null,
    isShielding: false,
    isWithdrawing: false,
    shieldAmount: 0,
    unshieldAmount: 0,
    setShieldAmount: () => { },
    setUnshieldAmount: () => { },
    deposit: async () => { },
    withdraw: async () => { },
    refreshBalance: async () => { },
    privateBalance: 0,
})

export const useShield = () => useContext(ShieldContext)

// --- Provider ---
export const ShieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { connection } = useConnection()
    const { publicKey, signTransaction } = useWallet()
    const [sdk, setSdk] = useState<PrivacyCash | null>(null)

    // State
    const [isShielding, setIsShielding] = useState(false)
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [shieldAmount, setShieldAmount] = useState<number>(0)
    const [unshieldAmount, setUnshieldAmount] = useState<number>(0)
    const [privateBalance, setPrivateBalance] = useState<number>(0)

    // Create a "Session Keypair" or derive one for the SDK (since SDK needs a keypair in constructor)
    // In a real production app, we would use a pure wallet adapter approach or derive from a signature.
    // For the hackathon and SDK limitation, we'll generate a session keypair stored in memory.
    const sessionKeypair = useRef<Keypair | null>(null)

    useEffect(() => {
        if (!sessionKeypair.current) {
            // Check for stored session key or generate new one
            const stored = localStorage.getItem('whaleshield_session_key')
            if (stored) {
                try {
                    sessionKeypair.current = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(stored)))
                } catch {
                    sessionKeypair.current = Keypair.generate()
                    localStorage.setItem('whaleshield_session_key', JSON.stringify(Array.from(sessionKeypair.current.secretKey)))
                }
            } else {
                sessionKeypair.current = Keypair.generate()
                localStorage.setItem('whaleshield_session_key', JSON.stringify(Array.from(sessionKeypair.current.secretKey)))
            }
        }
    }, [])

    useEffect(() => {
        if (publicKey && connection && sessionKeypair.current) {
            try {
                console.log("Initializing Privacy Cash SDK...")
                // The SDK takes 'owner' as keypair or secret key.
                // We use our session keypair as the "Privacy Identity".
                // The actual deposit funds come from the connected wallet (via our overridden signer).
                const privacySdk = new PrivacyCash({
                    RPC_url: connection.rpcEndpoint,
                    owner: sessionKeypair.current,
                    enableDebug: true,
                })

                // Override the internal keypair if needed, but the SDK uses the one passed in constructor.
                // Crucial: The SDK's deposit function uses `transactionSigner` callback.
                // We will pass the Wallet Adapter's signer there during the call.

                setSdk(privacySdk)
                toast.success("Privacy Shield Initialized")
            } catch (error) {
                console.error("Failed to init SDK:", error)
                toast.error("Failed to initialize Privacy Shield")
            }
        }
    }, [publicKey, connection])

    const refreshBalance = async () => {
        if (!sdk) return
        try {
            const bal = await sdk.getPrivateBalance()
            console.log("Private Balance (Lamports):", bal)
            setPrivateBalance(bal.lamports / 1e9) // Convert lamports to SOL
        } catch (e) {
            console.error("Error refreshing balance:", e)
        }
    }

    // Poll balance
    useEffect(() => {
        if (sdk) {
            refreshBalance()
            const interval = setInterval(refreshBalance, 10000)
            return () => clearInterval(interval)
        }
    }, [sdk])


    const deposit = async () => {
        if (!sdk || !publicKey || !signTransaction) {
            toast.error("Wallet not connected")
            return
        }

        if (shieldAmount <= 0) {
            toast.error("Enter a valid amount")
            return
        }

        try {
            setIsShielding(true)
            const lamports = shieldAmount * 1e9 // Convert SOL to Lamports

            console.log(`Depositing ${shieldAmount} SOL...`)

            // The SDK's deposit function signature:
            // async deposit({ lamports }) 
            // It uses the internal keypair by default.
            // We need to modify the SDK call pattern or rely on the fact that
            // the SDK's deposit() creates a transaction that needs signing.
            // 
            // The SDK we patched handles signing inside via a callback or internal key.
            // Looking at `deposit.ts` in SDK:
            // It accepts `transactionSigner`. 
            // But the `PrivacyCash` class method `deposit` wraps this and passes 
            // `tx.sign([this.keypair])`. 

            // Since `this.keypair` is our Session Key, it has no SOL!
            // The deposit needs to be paid by the MAIN wallet (connected via Adapter).

            // WORKAROUND: We need to bypass the `PrivacyCash.deposit` wrapper and call the internal 
            // `deposit` function directly, OR patch the SDK to accept a signer override.
            // 
            // Let's rely on the SDK patch we made -> wait, we didn't patch `deposit` wrapper yet.
            // 
            // Actually, standard Privacy Cash flow:
            // 1. User deposits from Main Wallet -> Privacy Pool.
            // 2. The `deposit` function builds a tx where `payer` is the signer.
            // 
            // In `PrivacyCash.ts` (index.ts), the `deposit` method hardcodes:
            // `transactionSigner: async (tx) => { tx.sign([this.keypair]); return tx }`
            // 
            // This means it expects `this.keypair` (the session key) to have SOL.
            // This is a common pattern for "Burner Wallets", but for a "Shield" from a main wallet,
            // we need the Main Wallet to sign.

            // We must patch `PrivacyCash.deposit` in the SDK to accept a `transactionSigner` override.
            // I will do this in the next step. For now, I'll write the context assuming the patch exists.

            // @ts-ignore - We will add this param to the SDK
            const txSignature = await sdk.deposit({
                lamports,
                // @ts-ignore - Future patch
                signer: publicKey,
                // @ts-ignore - Future patch
                transactionSigner: async (tx: VersionedTransaction) => {
                    // Use Wallet Adapter to sign!
                    return await signTransaction(tx)
                }
            })

            toast.success(`Shielded ${shieldAmount} SOL successfully!`)
            setShieldAmount(0)
            refreshBalance()

        } catch (error) {
            console.error("Deposit failed:", error)
            toast.error("Deposit failed: " + (error as any).message)
        } finally {
            setIsShielding(false)
        }
    }

    const withdraw = async () => {
        if (!sdk || !publicKey) {
            toast.error("Wallet not connected")
            return
        }

        if (unshieldAmount <= 0) {
            toast.error("Enter a valid amount to unshield")
            return
        }

        try {
            setIsWithdrawing(true)
            const lamports = unshieldAmount * 1e9

            console.log(`Unshielding ${unshieldAmount} SOL to ${publicKey.toString()}...`)

            const res = await sdk.withdraw({
                lamports,
                recipientAddress: publicKey.toString()
            })

            toast.success(`Unshielded ${unshieldAmount} SOL successfully!`)
            setUnshieldAmount(0)
            refreshBalance()
        } catch (error) {
            console.error("Withdraw failed:", error)
            toast.error("Withdraw failed: " + (error as any).message)
        } finally {
            setIsWithdrawing(false)
        }
    }

    return (
        <ShieldContext.Provider
            value={{
                sdk,
                isShielding,
                isWithdrawing,
                shieldAmount,
                unshieldAmount,
                setShieldAmount,
                setUnshieldAmount,
                deposit,
                withdraw,
                refreshBalance,
                privateBalance,
            }}
        >
            {children}
        </ShieldContext.Provider>
    )
}
