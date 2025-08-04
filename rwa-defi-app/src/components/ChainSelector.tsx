'use client'

import { useChainId, useSwitchChain, useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, CheckCircle, AlertCircle } from 'lucide-react'
import { addCustomNetwork } from '@/config/web3'
import { useState } from 'react'

const SUPPORTED_CHAINS = [
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    description: 'Ethereum testnet for development',
    color: 'text-blue-600',
    icon: '🔧'
  },
  {
    id: 1,
    name: 'Ethereum Mainnet',
    description: 'Ethereum mainnet',
    color: 'text-purple-600',
    icon: '🔷'
  },
  {
    id: 137,
    name: 'Polygon',
    description: 'Polygon network',
    color: 'text-purple-500',
    icon: '🟣'
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    description: 'Binance Smart Chain',
    color: 'text-yellow-600',
    icon: '🟡'
  }
]

export function ChainSelector() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending, error } = useSwitchChain()
  const [showCustom, setShowCustom] = useState(false)

  if (!isConnected) {
    return null
  }

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Network className="w-5 h-5" />
          <span>Network Selection</span>
        </CardTitle>
        <CardDescription>
          Current network: {currentChain?.name || `Unknown (${chainId})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {SUPPORTED_CHAINS.map((chain) => {
             const isActive = chainId === chain.id

            return (
              <Button
                key={chain.id}
                variant={isActive ? "default" : "outline"}
                className={`h-auto p-4 justify-start ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  if (!isActive) {
                    switchChain({ chainId: chain.id })
                  }
                }}
                disabled={isPending}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-xl">{chain.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{chain.name}</span>
                      {isActive && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {chain.description}
                    </p>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">
                Failed to switch network: {error.message}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => setShowCustom(!showCustom)}
            className="w-full"
          >
            {showCustom ? 'Hide' : 'Add'} Custom Network
          </Button>

          {showCustom && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <CustomNetworkForm />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CustomNetworkForm() {
  const [customNetwork, setCustomNetwork] = useState({
    chainId: '',
    name: '',
    rpcUrl: '',
    blockExplorer: '',
    symbol: 'ETH'
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNetwork = async () => {
    if (!customNetwork.chainId || !customNetwork.name || !customNetwork.rpcUrl) {
      alert('Please fill in all required fields')
      return
    }

    setIsAdding(true)
    try {
      const success = await addCustomNetwork(
        parseInt(customNetwork.chainId),
        customNetwork.name,
        customNetwork.rpcUrl,
        customNetwork.blockExplorer || undefined,
        {
          name: customNetwork.symbol,
          symbol: customNetwork.symbol,
          decimals: 18
        }
      )

      if (success) {
        alert('Network added successfully!')
        setCustomNetwork({
          chainId: '',
          name: '',
          rpcUrl: '',
          blockExplorer: '',
          symbol: 'ETH'
        })
      } else {
        alert('Failed to add network')
      }
    } catch (error) {
      console.error('Error adding network:', error)
      alert('Failed to add network')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Add Custom Network</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Network Name *
          </label>
          <input
            type="text"
            value={customNetwork.name}
            onChange={(e) => setCustomNetwork(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., My Custom Network"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chain ID *
          </label>
          <input
            type="number"
            value={customNetwork.chainId}
            onChange={(e) => setCustomNetwork(prev => ({ ...prev, chainId: e.target.value }))}
            placeholder="e.g., 1337"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RPC URL *
          </label>
          <input
            type="url"
            value={customNetwork.rpcUrl}
            onChange={(e) => setCustomNetwork(prev => ({ ...prev, rpcUrl: e.target.value }))}
            placeholder="https://rpc.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency Symbol
          </label>
          <input
            type="text"
            value={customNetwork.symbol}
            onChange={(e) => setCustomNetwork(prev => ({ ...prev, symbol: e.target.value }))}
            placeholder="ETH"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block Explorer URL (optional)
          </label>
          <input
            type="url"
            value={customNetwork.blockExplorer}
            onChange={(e) => setCustomNetwork(prev => ({ ...prev, blockExplorer: e.target.value }))}
            placeholder="https://explorer.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button
        onClick={handleAddNetwork}
        disabled={isAdding}
        className="w-full"
      >
        {isAdding ? 'Adding Network...' : 'Add Network'}
      </Button>
    </div>
  )
}