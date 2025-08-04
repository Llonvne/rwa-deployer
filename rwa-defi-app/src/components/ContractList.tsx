'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Coins, Building, Palette, Wrench, Eye, Send } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { getContractExplorerUrl } from '@/lib/contract-deployment'
import { formatAddress, formatValue, formatDate } from '@/lib/utils'
import { TokenBalance } from './TokenBalance'

interface ContractData {
  address: string
  name: string
  symbol: string
  category: string
  deployer: string
  deploymentTime: number
  verified: boolean
  assetType: string
  assetLocation: string
  assetValue: string
}

const CATEGORY_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  'Real Estate': { icon: Building, color: 'text-blue-600' },
  'Commodities': { icon: Coins, color: 'text-yellow-600' },
  'Art & Collectibles': { icon: Palette, color: 'text-purple-600' },
  'Equipment & Machinery': { icon: Wrench, color: 'text-gray-600' },
  'Other': { icon: Coins, color: 'text-gray-500' }
}

export function ContractList() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterVerified, setFilterVerified] = useState('All')
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration - in production, this would fetch from the factory contract
  const mockContracts: ContractData[] = [
    {
      address: '0x1234...abcd',
      name: 'Manhattan Real Estate Token',
      symbol: 'MRET',
      category: 'Real Estate',
      deployer: '0x5678...efgh',
      deploymentTime: Date.now() - 86400000, // 1 day ago
      verified: true,
      assetType: 'Commercial Property',
      assetLocation: '123 Wall St, New York, NY',
      assetValue: '5000000'
    },
    {
      address: '0x2345...bcde',
      name: 'Gold Reserve Token',
      symbol: 'GRT',
      category: 'Commodities',
      deployer: '0x6789...fghi',
      deploymentTime: Date.now() - 172800000, // 2 days ago
      verified: false,
      assetType: 'Precious Metal',
      assetLocation: 'Vault 42, Switzerland',
      assetValue: '1000000'
    },
    {
      address: '0x3456...cdef',
      name: 'Digital Art Collection',
      symbol: 'DAC',
      category: 'Art & Collectibles',
      deployer: '0x7890...ghij',
      deploymentTime: Date.now() - 259200000, // 3 days ago
      verified: true,
      assetType: 'NFT Collection',
      assetLocation: 'Digital',
      assetValue: '750000'
    }
  ]

  useEffect(() => {
    if (isConnected) {
      loadContracts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId])

  const loadContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      // In production, this would call the factory contract to get all deployed tokens
      // For now, we'll use mock data
      setTimeout(() => {
        setContracts(mockContracts)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading contracts:', error)
      setError('Failed to load contracts. Please try again.')
      setLoading(false)
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'All' || contract.category === filterCategory
    
    const matchesVerified = 
      filterVerified === 'All' || 
      (filterVerified === 'Verified' && contract.verified) ||
      (filterVerified === 'Unverified' && !contract.verified)

    return matchesSearch && matchesCategory && matchesVerified
  })

  const categories = Array.from(new Set(contracts.map(c => c.category)))

  const handleViewToken = (tokenAddress: string) => {
    setSelectedToken(selectedToken === tokenAddress ? null : tokenAddress)
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Contract List</CardTitle>
          <CardDescription>Connect your wallet to view deployed contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please connect your wallet to view the list of deployed RWA contracts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deployed Contracts</h2>
          <p className="text-gray-600">Browse and manage RWA tokens on this network</p>
        </div>
        <Button onClick={loadContracts} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, symbol, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification
              </label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Tokens</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredContracts.length} of {contracts.length} contracts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600">
              {contracts.length === 0 
                ? "No RWA contracts have been deployed yet." 
                : "No contracts match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredContracts.map((contract) => (
            <div key={contract.address} className="space-y-4">
              <ContractCard 
                contract={contract} 
                chainId={chainId}
                onViewToken={() => handleViewToken(contract.address)}
                isExpanded={selectedToken === contract.address}
              />
              
              {/* Token Balance Section */}
              {selectedToken === contract.address && (
                <div className="ml-8">
                  <TokenBalance 
                    tokenAddress={contract.address}
                    tokenName={contract.name}
                    tokenSymbol={contract.symbol}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContractCard({ 
  contract, 
  chainId,
  onViewToken,
  isExpanded
}: { 
  contract: ContractData
  chainId: number 
  onViewToken: () => void
  isExpanded: boolean
}) {
  const categoryConfig = CATEGORY_ICONS[contract.category] || CATEGORY_ICONS['Other']
  const CategoryIcon = categoryConfig.icon

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-100`}>
              <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{contract.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <CardDescription>{contract.symbol}</CardDescription>
                {contract.verified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onViewToken}
            >
              {isExpanded ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  View
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(getContractExplorerUrl(chainId, contract.address), '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium">{contract.category}</p>
          </div>
          <div>
            <p className="text-gray-500">Asset Value</p>
            <p className="font-medium">{formatValue(contract.assetValue)}</p>
          </div>
          <div>
            <p className="text-gray-500">Asset Type</p>
            <p className="font-medium">{contract.assetType}</p>
          </div>
          <div>
            <p className="text-gray-500">Deployed</p>
            <p className="font-medium">{formatDate(contract.deploymentTime)}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Location</p>
          <p className="font-medium text-sm">{contract.assetLocation}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Contract Address</p>
          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {formatAddress(contract.address)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-gray-500">
            Deployed by {formatAddress(contract.deployer)}
          </div>
          <div className="flex items-center space-x-2">
            {contract.verified ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unverified
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}