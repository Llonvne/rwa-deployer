import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia, mainnet, polygon, bsc } from 'wagmi/chains'
import { type Chain } from 'viem'

// Define project ID for Web3Modal
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Metadata for the app
const metadata = {
  name: 'RWA DeFi App',
  description: 'Real World Asset DeFi Application with Contract Deployment',
  url: 'https://rwa-defi.netlify.app', // Replace with your actual URL
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Custom chain definition helper
export const createCustomChain = (
  chainId: number,
  name: string,
  rpcUrl: string,
  blockExplorer?: string,
  nativeCurrency = { name: 'ETH', symbol: 'ETH', decimals: 18 }
): Chain => ({
  id: chainId,
  name,
  nativeCurrency,
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] }
  },
  blockExplorers: blockExplorer ? {
    default: { name: 'Explorer', url: blockExplorer }
  } : undefined
})

// Define the supported chains
export const chains = [
  sepolia, // Sepolia testnet (Chain ID: 11155111)
  mainnet, // Ethereum mainnet
  polygon, // Polygon
  bsc, // Binance Smart Chain
] as const

// Create wagmi config
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light'
})

// Chain configurations for easy access
export const CHAIN_CONFIG = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  mainnet: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com'
  }
}

// Utility function to add custom network
export const addCustomNetwork = async (
  chainId: number,
  name: string,
  rpcUrl: string,
  blockExplorer?: string,
  nativeCurrency = { name: 'ETH', symbol: 'ETH', decimals: 18 }
) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: name,
          rpcUrls: [rpcUrl],
          nativeCurrency,
          blockExplorerUrls: blockExplorer ? [blockExplorer] : undefined
        }]
      })
      return true
    } catch (error) {
      console.error('Failed to add custom network:', error)
      return false
    }
  }
  return false
}