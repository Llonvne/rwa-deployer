# Fixing Factory Deployment Issues

## Problem
The "Factory deployment failed: missing revert data" error occurs when the application tries to deploy smart contracts using placeholder bytecode instead of properly compiled bytecode.

## Solution

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Generate Contract Data
```bash
npx hardhat run scripts/deploy.js
```

This will create the necessary contract bytecode files that the frontend needs for deployment.

### 4. Start Development Server
```bash
npm run dev
```

## What Was Fixed

1. **Added Hardhat Configuration**: Set up proper Solidity compilation with multiple compiler versions to support OpenZeppelin contracts.

2. **Updated Contract Deployment**: Modified the deployment library to use properly compiled bytecode instead of placeholder bytecode.

3. **Fixed Factory Deployment**: Updated the RWA token deployment to properly call the factory's `deployRWAToken` method with the correct parameters.

4. **Added Proper Error Handling**: Improved error messages and deployment progress tracking.

## Key Changes

- `hardhat.config.js`: Added multi-compiler support for Solidity 0.8.19 and 0.8.20
- `src/lib/contract-deployment.ts`: Updated to load compiled bytecode and fixed deployment logic
- `scripts/deploy.js`: Created script to extract contract bytecode and ABI
- `package.json`: Added Hardhat and OpenZeppelin dependencies

## Testing

1. Connect your wallet (MetaMask recommended)
2. Switch to a test network (Sepolia, Goerli, or local Hardhat network)
3. Try deploying the RWA Factory
4. Then deploy an RWA Token using the factory

The deployment should now work without the "missing revert data" error.