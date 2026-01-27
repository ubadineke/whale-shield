import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { PrivacyCash } from 'privacycash';
import { EphemeralWallet } from './ephemeral';
import { JupiterClient } from './jupiter';
import { toast } from 'sonner';

export type TradeStep =
    | 'INITIALIZING'
    | 'WITHDRAWING_FROM_POOL'
    | 'WAITING_FOR_FUNDS'
    | 'SWAPPING_ON_JUPITER'
    | 'SHIELDING_RESULTS'
    | 'COMPLETED'
    | 'FAILED';

export interface TradeProgress {
    step: TradeStep;
    message: string;
}

export class TradeEngine {
    private sdk: PrivacyCash;
    private connection: Connection;

    constructor(sdk: PrivacyCash, connection: Connection) {
        this.sdk = sdk;
        this.connection = connection;
    }

    async executePrivateSwap(
        inputMint: string,
        outputMint: string,
        amountLamports: number,
        onProgress?: (progress: TradeProgress) => void
    ) {
        try {
            // 1. Initialize Ephemeral Wallet
            onProgress?.({ step: 'INITIALIZING', message: 'Generating ephemeral trading identity...' });
            const ephemeral = EphemeralWallet.generate();
            console.log('Ephemeral Wallet Public Key:', ephemeral.publicKey.toString());

            // 2. Withdraw from Privacy Cash to Ephemeral Wallet
            onProgress?.({ step: 'WITHDRAWING_FROM_POOL', message: 'Withdrawing shielded funds to ephemeral wallet...' });

            // We use the SDK to withdraw. The SDK will use its internal session key to generate proofs.
            const withdrawRes = await this.sdk.withdraw({
                lamports: amountLamports,
                recipientAddress: ephemeral.publicKey.toString(),
            });

            console.log('Withdrawal successful, tx:', withdrawRes.tx);

            // 3. Wait for funds to arrive in Ephemeral Wallet
            onProgress?.({ step: 'WAITING_FOR_FUNDS', message: 'Waiting for funds to arrive in ephemeral wallet...' });
            await this.waitForBalance(ephemeral.publicKey, 0); // Wait for balance to be > 0

            // 4. Swap on Jupiter
            onProgress?.({ step: 'SWAPPING_ON_JUPITER', message: 'Executing swap via Jupiter...' });

            // Is it a SPL or SOL swap?
            const isSolInput = inputMint === 'So11111111111111111111111111111111111111112';

            const quote = await JupiterClient.getQuote(inputMint, outputMint, amountLamports);
            const swapTxBase64 = await JupiterClient.getSwapTransaction(quote, ephemeral.publicKey.toString());

            const swapTx = VersionedTransaction.deserialize(Buffer.from(swapTxBase64, 'base64'));
            swapTx.sign([ephemeral.getKeypair()]);

            const swapSignature = await this.connection.sendTransaction(swapTx);
            await this.connection.confirmTransaction(swapSignature, 'confirmed');
            console.log('Swap completed, tx:', swapSignature);

            // 5. Shield results back to Privacy Cash
            onProgress?.({ step: 'SHIELDING_RESULTS', message: 'Shielding resulting assets back into privacy pool...' });

            // How much did we get?
            // We need to fetch the balance of the output mint in the ephemeral wallet.
            let resultAmount = 0;
            if (outputMint === 'So11111111111111111111111111111111111111112') {
                resultAmount = await this.connection.getBalance(ephemeral.publicKey);
                // Leave some for rent if we want, but usually we want to empty it.
                // Actually we should leave approx 0.005 SOL for fees if depositing multiple times.
                resultAmount -= 5000000;
            } else {
                // Fetch token account balance
                // Simplified for now: use the quote's expected output
                resultAmount = parseInt(quote.outAmount);
            }

            if (resultAmount > 0) {
                // Deposit back
                // We use the SDK but with the Ephemeral Wallet as the signer!
                await this.sdk.deposit({
                    lamports: resultAmount,
                    signer: ephemeral.publicKey,
                    transactionSigner: async (tx) => {
                        tx.sign([ephemeral.getKeypair()]);
                        return tx;
                    }
                });
            }

            onProgress?.({ step: 'COMPLETED', message: 'Private swap executed successfully. Wallet link broken.' });

        } catch (error) {
            console.error('Core Trade Engine Error:', error);
            onProgress?.({ step: 'FAILED', message: `Trade failed: ${(error as any).message}` });
            throw error;
        }
    }

    private async waitForBalance(pubkey: PublicKey, minBalance: number) {
        let attempts = 0;
        while (attempts < 30) {
            const bal = await this.connection.getBalance(pubkey);
            if (bal > minBalance) return bal;
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
        throw new Error('Timed out waiting for funds to arrive in ephemeral wallet.');
    }
}
