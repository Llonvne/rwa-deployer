'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, X, ExternalLink, Code } from 'lucide-react'

export function DemoNotice() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-blue-900">Demo Application Notice</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-blue-800">
          This is a demonstration version of the RWA DeFi application. Some features have limitations:
        </CardDescription>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-blue-900">Smart Contracts</p>
              <p className="text-sm text-blue-700">
                The demo includes simplified contract bytecode. For full functionality, deploy your own contracts using the provided Solidity code.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-blue-900">RWA Token Deployment</p>
              <p className="text-sm text-blue-700">
                Token deployment via factory requires a fully implemented factory contract with RWA-specific functions.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-blue-900">Test USDT</p>
              <p className="text-sm text-blue-700">
                Basic ERC20 implementation available for testing wallet connectivity and transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-4">
          <p className="text-sm font-medium text-blue-900 mb-2">For Production Use:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => window.open('https://hardhat.org/', '_blank')}
            >
              <Code className="w-4 h-4 mr-1" />
              Compile Contracts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => window.open('https://cloud.walletconnect.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Get WalletConnect ID
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Sepolia Explorer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}