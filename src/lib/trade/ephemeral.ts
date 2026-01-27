import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Manages temporary "Session" wallets for private trades.
 */
export class EphemeralWallet {
    private keypair: Keypair;

    constructor(secretKey?: string) {
        if (secretKey) {
            this.keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
        } else {
            this.keypair = Keypair.generate();
        }
    }

    get publicKey() {
        return this.keypair.publicKey;
    }

    get secretKey() {
        return bs58.encode(this.keypair.secretKey);
    }

    getKeypair() {
        return this.keypair;
    }

    static generate() {
        return new EphemeralWallet();
    }
}
