import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

export interface SwapQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    platformFee: null | any;
    priceImpactPct: string;
    routePlan: any[];
    contextSlot: number;
    timeTaken: number;
}

export class JupiterClient {
    private static JUP_API = 'https://quote-api.jup.ag/v6';

    static async getQuote(
        inputMint: string,
        outputMint: string,
        amount: number,
        slippageBps: number = 50
    ): Promise<SwapQuote> {
        const url = `${this.JUP_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Jupiter quote error: ${await response.text()}`);
        }
        return response.json();
    }

    static async getSwapTransaction(
        quoteResponse: SwapQuote,
        userPublicKey: string,
        wrapAndUnwrapSol: boolean = true
    ): Promise<string> {
        const response = await fetch(`${this.JUP_API}/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey,
                wrapAndUnwrapSol,
            }),
        });

        if (!response.ok) {
            throw new Error(`Jupiter swap error: ${await response.text()}`);
        }

        const { swapTransaction } = await response.json();
        return swapTransaction;
    }
}
