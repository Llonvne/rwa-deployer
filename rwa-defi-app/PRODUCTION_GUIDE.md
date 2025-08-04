# Production Deployment Guide

## 🔧 Implementing Full RWA Functionality

This guide explains how to deploy the complete RWA DeFi application with full smart contract functionality.

## 📋 Prerequisites

- Node.js 18.17.0+
- Hardhat or Foundry for contract compilation
- WalletConnect Project ID
- RPC endpoints (Infura/Alchemy/etc.)
- Testnet ETH for deployment

## 🏗 Smart Contract Deployment

### Step 1: Compile Contracts

Using Hardhat:

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init

# Copy Solidity files to contracts/
cp src/contracts/*.sol contracts/

# Compile contracts
npx hardhat compile
```

### Step 2: Update Bytecodes

After compilation, update the bytecodes in `src/lib/contract-deployment.ts`:

```typescript
export const CONTRACT_BYTECODES = {
  TestUSDT: "YOUR_COMPILED_TESTUSDT_BYTECODE",
  RWAFactory: "YOUR_COMPILED_RWAFACTORY_BYTECODE", 
  RWAToken: "YOUR_COMPILED_RWATOKEN_BYTECODE"
}
```

### Step 3: Deploy Factory Contract

Create a deployment script:

```javascript
// scripts/deploy.js
async function main() {
  const RWAFactory = await ethers.getContractFactory("RWAFactory");
  const deploymentFee = ethers.parseEther("0.001"); // 0.001 ETH
  
  const factory = await RWAFactory.deploy(deploymentFee);
  await factory.waitForDeployment();
  
  console.log("RWA Factory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🌐 Frontend Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_FACTORY_ADDRESS_SEPOLIA=0xYourFactoryAddress
NEXT_PUBLIC_FACTORY_ADDRESS_MAINNET=0xYourMainnetFactoryAddress
```

### Update Factory Addresses

In `src/config/chains.ts`:

```typescript
export const FACTORY_ADDRESSES = {
  11155111: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_SEPOLIA,
  1: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_MAINNET,
  // Add other networks
}
```

### RPC Configuration

Update `src/config/web3.ts`:

```typescript
export const CHAIN_CONFIG = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  // ... other networks
}
```

## 🔐 Security Configuration

### Contract Verification

1. **Verify on Etherscan**:
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_ADDRESS "constructor_arg1" "constructor_arg2"
   ```

2. **Add to block explorer**: Ensure all contracts are verified for transparency

### Access Controls

1. **Factory Ownership**: Set appropriate factory owner
2. **Deployment Fees**: Configure reasonable fees
3. **Verification Process**: Implement asset verification workflow

## 🚀 Production Deployment

### Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=out
```

### Environment Setup

In Netlify dashboard:

1. **Environment Variables**:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL`
   - `NEXT_PUBLIC_MAINNET_RPC_URL`
   - Factory addresses for each network

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18.17.0`

## ✅ Testing Checklist

### Smart Contracts
- [ ] Factory deploys successfully
- [ ] Factory can deploy RWA tokens
- [ ] Token parameters are set correctly
- [ ] Ownership controls work
- [ ] Deployment fees are collected
- [ ] Verification system functions

### Frontend
- [ ] Wallet connection works
- [ ] Chain switching functions
- [ ] Factory deployment wizard works
- [ ] Token deployment via factory works
- [ ] Real-time progress tracking
- [ ] Error handling for edge cases
- [ ] Contract verification links work

### Integration
- [ ] All networks configured
- [ ] RPC endpoints respond
- [ ] Block explorer links work
- [ ] Transaction monitoring works
- [ ] Gas estimation accurate

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Gas Prices**: Adjust deployment fees as needed
2. **Update Dependencies**: Keep packages up to date
3. **Monitor Contracts**: Watch for unusual activity
4. **Backup Data**: Regular backups of deployment records

### Upgrading Contracts

1. Deploy new versions
2. Update frontend configuration
3. Migrate data if necessary
4. Announce changes to users

## 🆘 Troubleshooting

### Common Issues

1. **"Contract not found"**:
   - Verify contract address is correct
   - Check network selection
   - Ensure contract is deployed

2. **"Transaction failed"**:
   - Check gas limits
   - Verify contract state
   - Check for require() failures

3. **"RPC Error"**:
   - Verify RPC endpoint
   - Check rate limits
   - Try alternative RPC

### Getting Help

1. Check contract events and logs
2. Use block explorer for transaction details
3. Test on testnets first
4. Monitor gas prices and network congestion

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Netlify Documentation](https://docs.netlify.com)

---

**Ready for Production!** 🎉

With these steps completed, you'll have a fully functional RWA DeFi application ready for real-world use.