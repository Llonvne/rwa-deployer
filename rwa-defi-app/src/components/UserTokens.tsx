'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, RefreshCw, Wallet, Coins, AlertCircle, Loader2 } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { BrowserProvider, Contract } from 'ethers'
import { Input } from '@/components/ui/input'
import { TokenBalance } from './TokenBalance'
import { RWA_TOKEN_ABI } from '@/lib/contract-deployment'
import { formatAddress } from '@/lib/utils'
import contractData from '@/lib/contract-data.json'

interface TokenInfo {
  address: string
  name: string
  symbol: string
  balance: bigint
  decimals: number
}

export function UserTokens() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [userTokens, setUserTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      loadUserTokens()
    }
  }, [isConnected, address, chainId])

  const loadUserTokens = async () => {
    if (!window.ethereum || !address) return

    setLoading(true)
    setError(null)
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      
      // In production, this would fetch from the factory contract to get all deployed tokens
      // For now, we'll use mock data from contract-data.json or hardcoded addresses
      const deployedTokens = contractData.deployedTokens || [
        // Fallback mock data if contract-data.json doesn't have deployedTokens
        '0x1234...abcd',
        '0x2345...bcde',
        '0x3456...cdef'
      ]
      
      const tokenInfoPromises = deployedTokens.map(async (tokenAddress) => {
        try {
          const contract = new Contract(tokenAddress, RWA_TOKEN_ABI, provider)
          
          const [name, symbol, decimals, balance] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.balanceOf(address)
          ])
          
          return {
            address: tokenAddress,
            name,
            symbol,
            balance,
            decimals
          }
        } catch (err) {
          console.error(`Error loading token at ${tokenAddress}:`, err)
          return null
        }
      })
      
      const results = await Promise.all(tokenInfoPromises)
      const validTokens = results
        .filter((token): token is TokenInfo => token !== null)
        .filter(token => token.balance > 0n) // Only show tokens with non-zero balance
      
      setUserTokens(validTokens)
    } catch (err) {
      console.error('Error loading user tokens:', err)
      setError('Failed to load your tokens. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTokens = userTokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewToken = (tokenAddress: string) => {
    setSelectedToken(selectedToken === tokenAddress ? null : tokenAddress)
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Your Tokens</span>
          </CardTitle>
          <CardDescription>Connect your wallet to view your tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please connect your wallet to view your token balances and make transfers.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Tokens</h2>
          <p className="text-gray-600">View and manage your RWA token balances</p>
        </div>
        <Button onClick={loadUserTokens} disabled={loading} variant="outline">
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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredTokens.length} of {userTokens.length} tokens
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your tokens...</p>
        </div>
      ) : filteredTokens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
            <p className="text-gray-600">
              {userTokens.length === 0 
                ? "You don't own any RWA tokens yet." 
                : "No tokens match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredTokens.map((token) => (
            <div key={token.address} className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Coins className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{token.name}</CardTitle>
                        <CardDescription>{token.symbol}</CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewToken(token.address)}
                    >
                      {selectedToken === token.address ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-gray-500 text-sm">Contract Address</p>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(token.address)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Token Balance Section */}
              {selectedToken === token.address && (
                <div className="ml-8">
                  <TokenBalance 
                    tokenAddress={token.address}
                    tokenName={token.name}
                    tokenSymbol={token.symbol}
                    decimals={token.decimals}
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