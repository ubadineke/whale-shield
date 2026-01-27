# WhaleShield Implementation Plan

## Project Goal
Build a privacy-preserving wallet dashboard for crypto whales using the Privacy Cash SDK. The app features a "Dual-Interface" system: a public "Decoy" view for observers and a private "Real" view for the user.

## 1. Project Setup & Architecture

### 1.1 Tech Stack
- **Frontend**: Next.js 15+ (App Router), React, TypeScript.
- **Styling**: TailwindCSS (v4), Framer Motion for premium animations.
- **Solana**: `@solana/web3.js`, `@solana/wallet-adapter`.
- **Privacy**: Local `privacy-cash-sdk` integration.
- **State Management**: Jotai (Atomic state for seamless updates).

### 1.2 SDK Integration Strategy
Since `privacy-cash-sdk` is a local folder, we will:
- Link it via `npm install ./privacy-cash-sdk` (Already done).
- Create a `PrivacyCashService` singleton to manage the SDK instance, protecting the `PrivacyCash` class initialization which requires a private key (or wallet adapter signing in the future).
- **Challenge**: The SDK constructs `PrivacyCash` using a private key (`owner`). For a non-custodial web app, we typically don't have the user's raw private key.
- **Solution**: We will likely need to adapt the SDK or wrap the `transactionSigner` to use the connected wallet's `signTransaction` method instead of a hardcoded keypair, OR generate a "Session Keypair" for the privacy interactions that the user funds/authorizes. *Integration with standard Wallet Adapter is critical here.*

## 2. Phase 1: Foundation & "Whale" Aesthetics
**Goal**: Set up the visual shell and core wallet connections.

- [ ] **Design System**: Implement "Dark/Glassmorphism" theme in `globals.css` (Deep blues, purples, neon accents).
- [ ] **Wallet Connection**: Ensure `SolanaProvider` wraps the app correctly for Phantom/Solflare.
- [ ] **Layout**: Create the `DashboardLayout` with a toggle for "Public View" / "Private View".
- [ ] **Navigation**: Sidebar with links: Dashboard, Shield (Deposit), Trade, Decoys, Settings.

## 3. Phase 2: Privacy Core (The "Shield")
**Goal**: Allow users to deposit funds into Privacy Cash pools.

- [ ] **Privacy Context**: Create a React Context/Hook (`usePrivacyCash`) to expose SDK methods.
- [ ] **Shield Page**:
    - Input: Amount to shield.
    - Config: Split strategy (random amounts) + Delay.
    - Action: Call `privacyCash.deposit()` / `depositSPL()`.
- [ ] **Note Management**:
    - Implement local storage (securely) for `Privacy Cash Notes`.
    - **Crucial**: The SDK seems to use `node-localstorage`. We need to ensure it works in the browser or polyfill it since Next.js is client-side.
    - Notes are the "keys" to the money. We will add an "Export/Backup Notes" feature immediately.

## 4. Phase 3: Private Trading Engine
**Goal**: Execute swaps without revealing the main wallet.

- [ ] **Workflow**:
    1. Select a Note (Unspent).
    2. Generate Ephemeral Keypair (Session Wallet).
    3. Generate ZK Proof (Withdraw to Ephemeral).
    4. **Swap**: Execute Jupiter Swap on the Ephemeral Wallet.
    5. Re-deposit: Send result back to Privacy Cash (New Note).
- [ ] **UI**: a "Private Swap" interface that looks like Jupiter but handles the complex 5-step flow in the background with progress indicators.

## 5. Phase 4: Decoy System & Public Facade
**Goal**: Make the user look like a "retail plankton" to observers.

- [ ] **Decoy Config**: Settings for "Max Spend", "Frequency", "Token List".
- [ ] **Generator**: A service that proposes random, small transactions (e.g., "Buy 0.1 SOL of BONK").
- [ ] **Execution**: User must approve these (or auto-approve if using a session bot). For the hackathon, "One-Click Execute Decoy Batch" is a safer, non-custodial approach.

## 6. Phase 5: Dashboards Summary
- [ ] **Private View**:
    - Aggregated balance of all Notes + Main Wallet.
    - True P&L.
- [ ] **Public View (The Mask)**:
    - Main Wallet Balance only.
    - List of "Decoy" trades.
    - "Bot Score" (simulated metric showing how 'retail' they look).

## 7. Next Immediate Steps
1.  **Fix Global CSS**: Re-apply the premium theme I started.
2.  **SDK Browser Compatibility Check**: Verify `privacy-cash-sdk` runs in the browser (handling `fs` or `node-localstorage` dependencies).
3.  **App Shell**: Build the Layout and Navigation.

---
*Verified by Antigravity*
