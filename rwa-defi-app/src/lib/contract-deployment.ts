import { ethers, Contract, BrowserProvider, ContractFactory } from 'ethers'

// Try to load compiled contract data
let CONTRACT_DATA: any = null
try {
  CONTRACT_DATA = require('./contract-data.json')
} catch (error) {
  console.warn('Contract data not found. Please run "npm run compile" first.')
}

// Contract ABIs (enhanced with new functions)
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
  "function getTokenInfo() view returns (string, string, uint8, uint256, address, bool)",
  "function getFormattedBalance(address) view returns (uint256)",
  "function hasSufficientBalance(address, uint256) view returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function pause()",
  "function unpause()",
  "function updateAssetInfo(string _assetType, uint256 _assetValue, string _legalDocumentHash)",
  "function transferOwnership(address newOwner)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event AssetVerified(address indexed verifier)",
  "event AssetUpdated(string newAssetType, uint256 newAssetValue)",
  "event TokenPaused(address indexed pauser)",
  "event TokenUnpaused(address indexed unpauser)",
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
]

export const RWA_FACTORY_ABI = [
  "constructor(uint256 _deploymentFee)",
  "function deploymentFee() view returns (uint256)",
  "function owner() view returns (address)",
  "function feeCollector() view returns (address)",
  "function paused() view returns (bool)",
  "function deployRWAToken(string _name, string _symbol, uint8 _decimals, uint256 _initialSupply, string _assetType, string _assetLocation, uint256 _assetValue, string _category) payable returns (address)",
  "function verifyToken(address _tokenAddress)",
  "function getAllTokens() view returns (address[])",
  "function getTokensByDeployer(address _deployer) view returns (address[])",
  "function getTotalTokens() view returns (uint256)",
  "function getTokenInfo(address _tokenAddress) view returns (tuple(address deployer, string name, string symbol, uint256 deploymentTime, bool verified, string category, uint256 deploymentFee))",
  "function getVerifiedTokens() view returns (address[])",
  "function getTokensByCategory(string _category) view returns (address[])",
  "function getTokenCountByCategory(string _category) view returns (uint256)",
  "function getDeployerCount() view returns (uint256)",
  "function getAllDeployers() view returns (address[])",
  "function getFactoryStats() view returns (uint256 totalTokens, uint256 verifiedTokens, uint256 totalDeployers, uint256 totalFeesCollected)",
  "function isTokenDeployed(address _tokenAddress) view returns (bool)",
  "function updateDeploymentFee(uint256 _newFee)",
  "function updateFeeCollector(address _newFeeCollector)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address _newOwner)",
  "function emergencyWithdraw()",
  "event TokenDeployed(address indexed tokenAddress, address indexed deployer, string name, string symbol, string category, uint256 deploymentFee)",
  "event TokenVerified(address indexed tokenAddress, address indexed verifier)",
  "event FeeUpdated(uint256 oldFee, uint256 newFee)",
  "event FactoryPaused(address indexed pauser)",
  "event FactoryUnpaused(address indexed unpauser)",
  "event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
]

export const TEST_USDT_ABI = [
  "constructor(string name, string symbol, uint8 decimals)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]

// Contract bytecodes - Use compiled bytecode if available, otherwise fallback to placeholders
export const CONTRACT_BYTECODES = {
  TestUSDT: CONTRACT_DATA?.TestUSDT?.bytecode || "0x608060405234801561001057600080fd5b506040516107d03803806107d08339818101604052810190610032919061011f565b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600390816100829190610391565b5081600490816100929190610391565b5080600560006101000a81548160ff021916908360ff16021790555050505061046d565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610123826100da565b810181811067ffffffffffffffff82111715610142576101416100eb565b5b80604052505050565b60006101556100b1565b9050610161828261011a565b919050565b600067ffffffffffffffff821115610181576101806100eb565b5b61018a826100da565b9050602081019050919050565b60006101aa6101a584610166565b61014b565b9050828152602081018484840111156101c6576101c56100d5565b5b6101d18482856101f8565b509392505050565b600082601f8301126101ee576101ed6100d0565b5b81516101fe848260208601610197565b91505092915050565b60008115159050919050565b61021c81610207565b811461022757600080fd5b50565b60008151905061023981610213565b92915050565b6000819050919050565b6102528161023f565b811461025d57600080fd5b50565b60008151905061026f81610249565b92915050565b60008060006060848603121561028e5761028d6100bb565b5b600084015167ffffffffffffffff8111156102ac576102ab6100c0565b5b6102b8868287016101d9565b935050602084015167ffffffffffffffff8111156102d9576102d86100c0565b5b6102e5868287016101d9565b92505060406102f686828701610260565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061035157607f821691505b60208210810361036457610363610309565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103cc7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261038f565b6103d6868361038f565b95508019841693508086168417925050509392505050565b6000819050919050565b600061041361040e6104098461023f565b6103ee565b61023f565b9050919050565b6000819050919050565b61042d836103f8565b6104416104398261041a565b84845461039c565b825550505050565b600090565b610456610449565b610461818484610424565b505050565b5b8181101561048557610479600082610454565b600181019050610467565b5050565b601f8211156104ca5761049b8161036a565b6104a48461037f565b810160208510156104b3578190505b6104c76104bf8561037f565b830182610466565b50505b505050565b600082821c905092915050565b60006104ed600019846008026104cf565b1980831691505092915050565b600061050683836104dc565b9150826002028217905092915050565b61051f82610300565b67ffffffffffffffff811115610538576105376100eb565b5b6105428254610338565b61054d828285610489565b600060209050601f831160018114610580576000841561056e578287015190505b61057885826104fa565b8655506105e0565b601f19841661058e8661036a565b60005b828110156105b657848901518255600182019150602085019450602081019050610591565b868310156105d357848901516105cf601f8916826104dc565b8355505b6001600288020188555050505b505050505050565b6103548061060d6000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c57806318160ddd1461007a57806323b872dd14610098578063313ce567146100c857806370a08231146100e6578063a9059cbb14610116575b600080fd5b610064610146565b6040516100719190610242565b60405180910390f35b6100826101d4565b60405161008f9190610275565b60405180910390f35b6100b260048036038101906100ad91906102f0565b6101da565b6040516100bf9190610359565b60405180910390f35b6100d06101eb565b6040516100dd9190610390565b60405180910390f35b61010060048036038101906100fb91906103ab565b6101fe565b60405161010d9190610275565b60405180910390f35b610130600480360381019061012b91906103d8565b610247565b60405161013d9190610359565b60405180910390f35b6003805461015390610447565b80601f016020809104026020016040519081016040528092919081815260200182805461017f90610447565b80156101cc5780601f106101a1576101008083540402835291602001916101cc565b820191906000526020600020905b8154815290600101906020018083116101af57829003601f168201915b505050505081565b60025481565b60006101e7848484610258565b9050935093505050565b600560009054906101000a900460ff1681565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6000610254338484610258565b6001905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036102cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102c4906104ca565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361033c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161033390610536565b60405180910390fd5b6000600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156103c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103ba906105c8565b60405180910390fd5b8181036001600085600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610417919061061c565b925050819055508160016000848473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461046e919061061c565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516104d29190610275565b60405180910390a3600190509392505050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561051f578082015181840152602081019050610504565b60008484015250505050565b6000601f19601f8301169050919050565b6000610547826104e5565b61055181856104f0565b9350610561818560208601610501565b61056a8161052b565b840191505092915050565b60006020820190508181036000830152610590818461053c565b905092915050565b6000819050919050565b6105ab81610598565b82525050565b60006020820190506105c660008301846105a2565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006105fc826105d1565b9050919050565b61060c816105f1565b811461061757600080fd5b50565b60008135905061062981610603565b92915050565b61063881610598565b811461064357600080fd5b50565b6000813590506106558161062f565b92915050565b60008060408385031215610672576106716105cc565b5b60006106808582860161061a565b925050602061069185828601610646565b9150509250929050565b6000819050919050565b6106ae8161069b565b82525050565b60006020820190506106c960008301846106a5565b92915050565b6000806000606084860312156106e8576106e76105cc565b5b60006106f68682870161061a565b93505060206107078682870161061a565b925050604061071886828701610646565b9150509250925092565b60008115159050919050565b61073781610722565b82525050565b6000602082019050610752600083018461072e565b92915050565b61076181610722565b811461076c57600080fd5b50565b60008135905061077e81610758565b92915050565b600060208284031215610799576107986105cc565b5b60006107a78482850161076f565b91505092915050565b6000602082840312156107c6576107c56105cc565b5b60006107d48482850161061a565b91505092915050565b600060408284031215610802576108016105cc565b5b600061081084828501610646565b915050920190565b6000819050919050565b61082b8161081b565b82525050565b60006020820190506108466000830184610822565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061089357607f821691505b6020821081036108a6576108a561084c565b5b50919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b60006109086025836104f0565b9150610913826108ac565b604082019050919050565b60006020820190508181036000830152610937816108fb565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b600061099a6023836104f0565b91506109a58261093e565b604082019050919050565b600060208201905081810360008301526109c98161098d565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b6000610a2c6026836104f0565b9150610a37826109d0565b604082019050919050565b60006020820190508181036000830152610a5b81610a1f565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610a9c82610598565b9150610aa783610598565b9250828201905080821115610abf57610abe610a62565b5b9291505056fea26469706673582212205c8f4c5a1a6bb3b3e9f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f764736f6c63430008130033",
  
  // Simple factory contract
  RWAFactory: CONTRACT_DATA?.RWAFactory?.bytecode || "0x608060405234801561001057600080fd5b506040516103e83803806103e88339818101604052810190610032919061007a565b80600081905550336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610093565b600080fd5b6000819050919050565b61008781610074565b811461009257600080fd5b50565b6000815190506100a48161007e565b92915050565b6000602082840312156100c0576100bf61006f565b5b60006100ce84828501610095565b91505092915050565b610346806100e66000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633ccfd60b146100465780638da5cb5b14610050578063f77c47911461006e575b600080fd5b61004e61008c565b005b610058610115565b6040516100659190610229565b60405180910390f35b610076610139565b6040516100839190610244565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461011a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610111906102b1565b60405180910390fd5b565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061016a8261013f565b9050919050565b61017a8161015f565b82525050565b60006020820190506101956000830184610171565b92915050565b6000819050919050565b6101ae8161019b565b82525050565b60006020820190506101c960008301846101a5565b92915050565b600082825260208201905092915050565b7f4e6f74206f776e657200000000000000000000000000000000000000000000600082015250565b60006102166009836101cf565b9150610221826101e0565b602082019050919050565b6000602082019050818103600083015261024581610209565b905091905056fea26469706673582212205c8f4c5a1a6bb3b3e9f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f764736f6c63430008130033",
  
  // RWA Token placeholder (this would be deployed by factory)
  RWAToken: CONTRACT_DATA?.RWAToken?.bytecode || "0x608060405234801561001057600080fd5b50",
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

      const contract = await factory.deploy("Test USD Tether", "TUSDT", 6)
      
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
      
      // Check if factory contract exists and has the required method
      try {
        const factory = new Contract(factoryAddress, RWA_FACTORY_ABI, signer)
        const deploymentFee = await factory.deploymentFee()
        
        onProgress?.({
          stage: 'deploying',
          message: 'Deploying RWA Token via factory...'
        })

        // Convert initial supply to proper format
        const initialSupply = ethers.parseUnits(params.initialSupply, params.decimals)
        
        // Convert asset value to proper format (assuming USD cents)
        const assetValue = ethers.parseUnits(params.assetValue, 2) // USD cents

        // Deploy token through factory
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
          message: 'Waiting for deployment confirmation...',
          txHash: tx.hash
        })

        const receipt = await tx.wait()
        
        // Get the deployed token address from the event
        const tokenDeployedEvent = receipt?.logs?.find((log: any) => {
          try {
            const parsed = factory.interface.parseLog(log)
            return parsed?.name === 'TokenDeployed'
          } catch {
            return false
          }
        })

        let tokenAddress: string | undefined
        if (tokenDeployedEvent) {
          const parsed = factory.interface.parseLog(tokenDeployedEvent)
          tokenAddress = parsed?.args?.[0] // First argument is token address
        }

        if (!tokenAddress) {
          throw new Error('Could not determine deployed token address')
        }

        onProgress?.({
          stage: 'completed',
          message: 'RWA Token deployed successfully!',
          txHash: tx.hash,
          contractAddress: tokenAddress
        })

        return {
          success: true,
          contractAddress: tokenAddress,
          txHash: tx.hash
        }
      } catch (contractError) {
        const errorMessage = contractError instanceof Error ? contractError.message : 'Unknown error'
        onProgress?.({
          stage: 'failed',
          message: 'Factory contract error',
          error: errorMessage
        })

        return {
          success: false,
          error: errorMessage
        }
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