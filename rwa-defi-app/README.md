# RWA DeFi App

A comprehensive Real World Asset (RWA) DeFi application built with Next.js, TypeScript, and Web3 technologies. Deploy and manage tokenized real-world assets on Ethereum and other EVM-compatible blockchains.

## 🚀 Features

### ✅ Core Functionality
- **Smart Contract Factory**: Deploy standardized RWA tokens with built-in governance and compliance features
- **Multi-Chain Support**: Works on Sepolia testnet, Ethereum mainnet, Polygon, BSC, and custom networks
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets via Web3Modal
- **Real-time Monitoring**: Track contract deployment progress and transaction status
- **Asset Management**: Track real-world asset values, legal documentation, and verification status

### ✅ Smart Contracts
- **RWA Token Contract**: ERC20-compliant token with asset metadata, pause functionality, and ownership controls
- **RWA Factory Contract**: Deploy and manage multiple RWA tokens with verification system
- **Test USDT Contract**: For testing purposes on Sepolia testnet

### ✅ User Interface
- **Deployment Wizard**: Step-by-step guided contract deployment
- **Contract Browser**: View and filter deployed RWA contracts
- **Chain Switching**: Easy network switching with custom network support
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, Custom UI Components
- **Web3**: wagmi, viem, ethers.js, Web3Modal
- **Smart Contracts**: Solidity 0.8.19
- **Deployment**: Netlify

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- MetaMask or compatible Web3 wallet

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rwa-defi-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```
   
   Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Supported Networks

### Default Networks
- **Sepolia Testnet** (Chain ID: 11155111) - Primary testnet for development
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BNB Smart Chain** (Chain ID: 56)

### Custom Networks
The app supports adding custom EVM-compatible networks through the UI or configuration.

## 🏗 Architecture

### Smart Contracts

#### RWAToken.sol
- ERC20-compliant token representing real-world assets
- Features: minting, burning, pausing, asset metadata tracking
- Ownership controls and verification system

#### RWAFactory.sol
- Factory pattern for deploying RWA tokens
- Deployment fee mechanism
- Token verification and management
- Categorization and filtering

#### TestUSDT.sol
- Test USDT implementation for Sepolia testnet
- Faucet functionality for easy testing

### Frontend Components

#### Deployment Wizard
- Step-by-step contract deployment process
- Factory setup, token configuration, review, and deployment
- Real-time progress tracking

#### Contract Management
- Browse deployed contracts with filtering
- Search by name, symbol, or address
- Category-based organization

#### Wallet Integration
- Web3Modal integration for wallet connections
- Chain switching with custom network support
- Real-time wallet status and balance display

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Or use the deploy button below

2. **Environment Variables**
   Set these in Netlify dashboard:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Deploy**
   - Automatic deployment on git push
   - Preview deployments for pull requests

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_REPO_URL)

### Manual Deployment

```bash
# Build the application
npm run build

# Export static files (if needed)
npm run export
```

## 📚 Usage Guide

### Getting Started

1. **Connect Wallet**
   - Click "Connect Wallet" and select your preferred wallet
   - Ensure you're on a supported network (recommend starting with Sepolia testnet)

2. **Get Test Tokens** (Sepolia only)
   - Use the faucet to get test ETH: [Sepolia Faucet](https://sepoliafaucet.com/)
   - Deploy Test USDT via the deployment wizard for testing

3. **Deploy RWA Factory**
   - Navigate to the "Deploy" tab
   - Choose deployment fee (recommended: 0.001 ETH for testing)
   - Deploy the factory contract

4. **Create RWA Token**
   - Configure token parameters (name, symbol, asset details)
   - Review configuration
   - Deploy through the factory

5. **Manage Contracts**
   - View deployed contracts in the "Contracts" tab
   - Filter by category or verification status
   - Click contract addresses to view on block explorer

### Testing on Sepolia

1. Get Sepolia ETH from faucets
2. Deploy factory with minimal fees
3. Create test RWA tokens for different asset categories
4. Test all functionality before mainnet deployment

## 🔧 Configuration

### Custom RPC Endpoints

Update `src/config/web3.ts` to use your own RPC endpoints:

```typescript
export const CHAIN_CONFIG = {
  sepolia: {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    // ...
  }
}
```

### Adding New Networks

Use the custom network form in the UI or modify the configuration:

```typescript
const customChain = createCustomChain(
  1337, // Chain ID
  'Local Network',
  'http://localhost:8545'
)
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Contract Compilation

The app includes placeholder bytecodes for contracts. For production deployment:

1. Compile Solidity contracts using Hardhat or Foundry
2. Update bytecodes in `src/lib/contract-deployment.ts`
3. Deploy factory contracts to desired networks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

### Smart Contract Security
- Contracts include standard security patterns (reentrancy protection, ownership controls)
- Pause functionality for emergency situations
- Verification system for asset legitimacy

### Frontend Security
- CSP headers configured in Netlify
- Environment variables for sensitive data
- Client-side validation and sanitization

### Recommendations
- Always test on testnets first
- Use hardware wallets for production deployments
- Regular security audits for smart contracts
- Keep dependencies updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Web3Modal](https://web3modal.com/) for wallet connection
- [wagmi](https://wagmi.sh/) for React Web3 hooks
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [ethers.js](https://ethers.org/) for Ethereum interaction

## 📞 Support

For support, please:
1. Check the [Issues](https://github.com/your-repo/issues) section
2. Create a new issue with detailed description
3. Join our [Discord](https://discord.gg/your-discord) community

---

**Made with ❤️ for the RWA ecosystem**
