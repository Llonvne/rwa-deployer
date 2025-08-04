'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeploymentWizard } from '@/components/DeploymentWizard'
import { WalletConnection } from '@/components/WalletConnection'
import { ChainSelector } from '@/components/ChainSelector'
import { ContractList } from '@/components/ContractList'
import { DemoNotice } from '@/components/DemoNotice'
import { Wallet, Factory, Coins, Network } from 'lucide-react'

export default function HomePage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'deploy' | 'contracts' | 'tools'>('deploy')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          RWA DeFi App
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Deploy and manage Real World Asset tokens on the blockchain. 
          Tokenize real estate, commodities, art, and other assets with our secure smart contract factory.
        </p>
      </div>

      {/* Demo Notice */}
      <DemoNotice />

      {/* Wallet Connection Section */}
      <div className="mb-8">
        <WalletConnection />
        {isConnected && (
          <div className="mt-4">
            <ChainSelector />
          </div>
        )}
      </div>

      {/* Main Content */}
      {isConnected ? (
        <div className="space-y-8">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'deploy'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>Deploy</span>
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contracts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Contracts</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Tools</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'deploy' && <DeploymentWizard />}
          {activeTab === 'contracts' && <ContractList />}
          {activeTab === 'tools' && <ToolsSection />}
        </div>
      ) : (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Wallet className="w-6 h-6" />
                <span>Connect Your Wallet</span>
              </CardTitle>
              <CardDescription>
                Connect your wallet to start deploying RWA contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You need to connect a Web3 wallet to interact with smart contracts.
                We support MetaMask and other popular wallets.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Factory className="w-5 h-5 text-blue-600" />
              <span>Smart Contract Factory</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Deploy standardized RWA tokens with built-in governance, 
              compliance features, and asset metadata tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-green-600" />
              <span>Multi-Chain Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Deploy on Ethereum, Polygon, BSC, and other EVM-compatible networks. 
              Add custom networks as needed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-purple-600" />
              <span>Asset Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Track real-world asset values, legal documentation, 
              and verification status on-chain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ToolsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
          <CardDescription>
            Add custom networks and RPC endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure custom blockchain networks for deployment.
          </p>
          <Button variant="outline" className="w-full">
            Configure Networks
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Verification</CardTitle>
          <CardDescription>
            Verify deployed contracts on block explorers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Automatically verify your contracts for transparency.
          </p>
          <Button variant="outline" className="w-full">
            Verify Contracts
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
