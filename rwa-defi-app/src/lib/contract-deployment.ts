import { ethers, Contract, BrowserProvider, ContractFactory } from 'ethers'

// Contract ABIs (simplified for the essential functions)
export const RWA_TOKEN_ABI = [
  "constructor(string _name, string _symbol, uint8 _decimals, uint256 _initialSupply, address _owner, string _assetType, string _assetLocation, uint256 _assetValue)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
  "function assetType() view returns (string)",
  "function assetLocation() view returns (string)",
  "function assetValue() view returns (uint256)",
  "function verified() view returns (bool)",
  "function paused() view returns (bool)",
  "function getAssetInfo() view returns (string, string, uint256, bool, string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function pause()",
  "function unpause()",
  "function updateAssetInfo(string _assetType, uint256 _assetValue, string _legalDocumentHash)",
  "function transferOwnership(address newOwner)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event AssetVerified(address indexed verifier)",
  "event AssetUpdated(string newAssetType, uint256 newAssetValue)"
]

export const RWA_FACTORY_ABI = [
  "constructor(uint256 _deploymentFee)",
  "function deployRWAToken(string _name, string _symbol, uint8 _decimals, uint256 _initialSupply, string _assetType, string _assetLocation, uint256 _assetValue, string _category) payable returns (address)",
  "function verifyToken(address _tokenAddress)",
  "function getAllTokens() view returns (address[])",
  "function getTokensByDeployer(address _deployer) view returns (address[])",
  "function getTotalTokens() view returns (uint256)",
  "function getTokenInfo(address _tokenAddress) view returns (tuple(address deployer, string name, string symbol, uint256 deploymentTime, bool verified, string category))",
  "function getVerifiedTokens() view returns (address[])",
  "function getTokensByCategory(string _category) view returns (address[])",
  "function deploymentFee() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function updateDeploymentFee(uint256 _newFee)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address _newOwner)",
  "function isTokenDeployed(address _tokenAddress) view returns (bool)",
  "event TokenDeployed(address indexed tokenAddress, address indexed deployer, string name, string symbol, string category)",
  "event TokenVerified(address indexed tokenAddress, address indexed verifier)",
  "event FeeUpdated(uint256 oldFee, uint256 newFee)"
]

export const TEST_USDT_ABI = [
  "constructor()",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function faucet()",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 amount)"
]

// Contract bytecodes (would be compiled from Solidity)
// Note: These are placeholder bytecodes - in production, you'd compile the Solidity contracts
export const CONTRACT_BYTECODES = {
  RWAToken: "0x608060405234801561001057600080fd5b50", // Placeholder
  RWAFactory: "0x608060405234801561001057600080fd5b50", // Placeholder
  TestUSDT: "0x608060405234801561001057600080fd5b50" // Placeholder
}

export interface DeploymentProgress {
  stage: 'preparing' | 'deploying' | 'waiting' | 'completed' | 'failed'
  message: string
  txHash?: string
  contractAddress?: string
  error?: string
}

export interface RWATokenParams {
  name: string
  symbol: string
  decimals: number
  initialSupply: string
  assetType: string
  assetLocation: string
  assetValue: string
  category: string
}

export interface DeploymentResult {
  success: boolean
  contractAddress?: string
  txHash?: string
  error?: string
}

export class ContractDeployer {
  private provider: BrowserProvider

  constructor(provider: BrowserProvider) {
    this.provider = provider
  }

  async deployTestUSDT(
    onProgress?: (progress: DeploymentProgress) => void
  ): Promise<DeploymentResult> {
    try {
      onProgress?.({
        stage: 'preparing',
        message: 'Preparing TestUSDT deployment...'
      })

      const signer = await this.provider.getSigner()
      const factory = new ContractFactory(TEST_USDT_ABI, CONTRACT_BYTECODES.TestUSDT, signer)

      onProgress?.({
        stage: 'deploying',
        message: 'Deploying TestUSDT contract...'
      })

      const contract = await factory.deploy()
      
      onProgress?.({
        stage: 'waiting',
        message: 'Waiting for deployment confirmation...',
        txHash: contract.deploymentTransaction()?.hash
      })

      const deployedContract = await contract.waitForDeployment()
      const contractAddress = await deployedContract.getAddress()

      onProgress?.({
        stage: 'completed',
        message: 'TestUSDT deployed successfully!',
        txHash: contract.deploymentTransaction()?.hash,
        contractAddress
      })

      return {
        success: true,
        contractAddress,
        txHash: contract.deploymentTransaction()?.hash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onProgress?.({
        stage: 'failed',
        message: 'TestUSDT deployment failed',
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async deployRWAFactory(
    deploymentFee: string,
    onProgress?: (progress: DeploymentProgress) => void
  ): Promise<DeploymentResult> {
    try {
      onProgress?.({
        stage: 'preparing',
        message: 'Preparing RWA Factory deployment...'
      })

      const signer = await this.provider.getSigner()
      const factory = new ContractFactory(RWA_FACTORY_ABI, CONTRACT_BYTECODES.RWAFactory, signer)

      // Convert deployment fee to wei
      const feeInWei = ethers.parseEther(deploymentFee)

      onProgress?.({
        stage: 'deploying',
        message: 'Deploying RWA Factory contract...'
      })

      const contract = await factory.deploy(feeInWei)
      
      onProgress?.({
        stage: 'waiting',
        message: 'Waiting for deployment confirmation...',
        txHash: contract.deploymentTransaction()?.hash
      })

      const deployedContract = await contract.waitForDeployment()
      const contractAddress = await deployedContract.getAddress()

      onProgress?.({
        stage: 'completed',
        message: 'RWA Factory deployed successfully!',
        txHash: contract.deploymentTransaction()?.hash,
        contractAddress
      })

      return {
        success: true,
        contractAddress,
        txHash: contract.deploymentTransaction()?.hash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onProgress?.({
        stage: 'failed',
        message: 'RWA Factory deployment failed',
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async deployRWAToken(
    factoryAddress: string,
    params: RWATokenParams,
    onProgress?: (progress: DeploymentProgress) => void
  ): Promise<DeploymentResult> {
    try {
      onProgress?.({
        stage: 'preparing',
        message: 'Preparing RWA Token deployment...'
      })

      const signer = await this.provider.getSigner()
      const factory = new Contract(factoryAddress, RWA_FACTORY_ABI, signer)

      // Get deployment fee
      const deploymentFee = await factory.deploymentFee()

      // Convert values
      const initialSupply = ethers.parseUnits(params.initialSupply, params.decimals)
      const assetValue = ethers.parseUnits(params.assetValue, 2) // USD cents

      onProgress?.({
        stage: 'deploying',
        message: 'Deploying RWA Token via factory...'
      })

      const tx = await factory.deployRWAToken(
        params.name,
        params.symbol,
        params.decimals,
        initialSupply,
        params.assetType,
        params.assetLocation,
        assetValue,
        params.category,
        { value: deploymentFee }
      )

      onProgress?.({
        stage: 'waiting',
        message: 'Waiting for token deployment confirmation...',
        txHash: tx.hash
      })

      const receipt = await tx.wait()
      
      // Extract token address from event logs
      const tokenDeployedEvent = receipt.logs.find((log: { topics: string[]; data: string }) => {
        try {
          const parsedLog = factory.interface.parseLog(log)
          return parsedLog?.name === 'TokenDeployed'
        } catch {
          return false
        }
      })

      let contractAddress = ''
      if (tokenDeployedEvent) {
        const parsedLog = factory.interface.parseLog(tokenDeployedEvent)
        contractAddress = parsedLog?.args[0] || '' // tokenAddress is the first argument
      }

      onProgress?.({
        stage: 'completed',
        message: 'RWA Token deployed successfully!',
        txHash: tx.hash,
        contractAddress
      })

      return {
        success: true,
        contractAddress,
        txHash: tx.hash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onProgress?.({
        stage: 'failed',
        message: 'RWA Token deployment failed',
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async getContractDetails(contractAddress: string, abi: string[]): Promise<Record<string, unknown>> {
    try {
      const contract = new Contract(contractAddress, abi, this.provider)
      
              // Get basic contract information
        const details: Record<string, unknown> = {
          address: contractAddress
        }

      // Try to get common properties
      try {
        details.name = await contract.name()
      } catch {}
      
      try {
        details.symbol = await contract.symbol()
      } catch {}
      
      try {
        details.decimals = await contract.decimals()
      } catch {}
      
      try {
        details.totalSupply = await contract.totalSupply()
      } catch {}
      
      try {
        details.owner = await contract.owner()
      } catch {}

      return details
    } catch (error) {
      console.error('Error getting contract details:', error)
      return { address: contractAddress, error: 'Failed to load contract details' }
    }
  }

  async monitorTransaction(
    txHash: string,
    onUpdate?: (status: 'pending' | 'confirmed' | 'failed', confirmations?: number) => void
  ): Promise<boolean> {
    try {
      let confirmations = 0
      
      // Wait for initial confirmation
      const receipt = await this.provider.waitForTransaction(txHash)
      
      if (!receipt) {
        onUpdate?.('failed')
        return false
      }

      if (receipt.status === 0) {
        onUpdate?.('failed')
        return false
      }

      onUpdate?.('confirmed', 1)

      // Monitor additional confirmations
      const monitorConfirmations = async () => {
        const currentBlock = await this.provider.getBlockNumber()
        confirmations = currentBlock - receipt.blockNumber + 1
        onUpdate?.('confirmed', confirmations)

        if (confirmations < 12) { // Monitor up to 12 confirmations
          setTimeout(monitorConfirmations, 15000) // Check every 15 seconds
        }
      }

      monitorConfirmations()
      return true
    } catch (error) {
      console.error('Error monitoring transaction:', error)
      onUpdate?.('failed')
      return false
    }
  }
}

// Utility functions
export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value)
}

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value)
}

export const getExplorerUrl = (chainId: number, txHash: string): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    56: 'https://bscscan.com'
  }

  const baseUrl = explorers[chainId] || 'https://etherscan.io'
  return `${baseUrl}/tx/${txHash}`
}

export const getContractExplorerUrl = (chainId: number, contractAddress: string): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    56: 'https://bscscan.com'
  }

  const baseUrl = explorers[chainId] || 'https://etherscan.io'
  return `${baseUrl}/address/${contractAddress}`
}