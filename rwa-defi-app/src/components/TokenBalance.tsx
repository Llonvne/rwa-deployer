'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { BrowserProvider, Contract } from 'ethers'
import { RWA_TOKEN_ABI } from '@/lib/contract-deployment'
import { 
  formatAddress, 
  formatBalance, 
  copyToClipboard, 
  getExplorerUrl, 
  validateAddress, 
  validateAmount 
} from '@/lib/utils'

interface TokenBalanceProps {
  tokenAddress: string
  tokenName?: string
  tokenSymbol?: string
  decimals?: number
}

interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  balance: bigint
  owner: string
  paused: boolean
  verified: boolean
}

export function TokenBalance({ 
  tokenAddress, 
  tokenName, 
  tokenSymbol, 
  decimals = 18 
}: TokenBalanceProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isConnected && tokenAddress) {
      loadTokenInfo()
    }
  }, [isConnected, tokenAddress, address])

  const loadTokenInfo = async () => {
    if (!window.ethereum || !tokenAddress) return

    setLoading(true)
    setError(null)

    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(tokenAddress, RWA_TOKEN_ABI, provider)

      const [
        name,
        symbol,
        decimals,
        totalSupply,
        balance,
        owner,
        paused,
        verified
      ] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        address ? contract.balanceOf(address) : Promise.resolve(0n),
        contract.owner(),
        contract.paused(),
        contract.verified()
      ])

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply,
        balance,
        owner,
        paused,
        verified
      })
    } catch (err) {
      console.error('Error loading token info:', err)
      setError('Failed to load token information. Please check if the contract address is correct.')
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!window.ethereum || !address || !tokenAddress) return

    if (!transferTo || !transferAmount) {
      setError('Please fill in all fields')
      return
    }

    if (!validateAddress(transferTo)) {
      setError('Invalid recipient address format')
      return
    }

    if (!validateAmount(transferAmount)) {
      setError('Invalid amount')
      return
    }

    setTransferLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(tokenAddress, RWA_TOKEN_ABI, signer)

      // Convert amount to token units
      const amountInWei = BigInt(Math.floor(parseFloat(transferAmount) * Math.pow(10, tokenInfo?.decimals || 18)))

      // Check if user has sufficient balance
      if (tokenInfo && amountInWei > tokenInfo.balance) {
        setError('Insufficient balance for transfer')
        return
      }

      const tx = await contract.transfer(transferTo, amountInWei)
      
      setSuccess(`Transfer initiated! Transaction: ${formatAddress(tx.hash)}`)
      setTransferAmount('')
      setTransferTo('')

      // Wait for confirmation
      await tx.wait()
      setSuccess('Transfer completed successfully!')
      
      // Reload token info
      await loadTokenInfo()
    } catch (err: any) {
      console.error('Transfer error:', err)
      setError(err.message || 'Transfer failed. Please check your balance and try again.')
    } finally {
      setTransferLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await copyToClipboard(tokenAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Token Balance</span>
          </CardTitle>
          <CardDescription>Connect your wallet to view token balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please connect your wallet to view and manage token balances.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Token Information</span>
            </div>
            <Button
              onClick={loadTokenInfo}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            {tokenInfo ? `${tokenInfo.name} (${tokenInfo.symbol})` : 'Loading token information...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : tokenInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Token Name</p>
                  <p className="font-medium">{tokenInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Token Symbol</p>
                  <p className="font-medium">{tokenInfo.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decimals</p>
                  <p className="font-medium">{tokenInfo.decimals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Supply</p>
                  <p className="font-medium">{formatBalance(tokenInfo.totalSupply, tokenInfo.decimals)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Balance</p>
                  <p className="font-medium text-lg">{formatBalance(tokenInfo.balance, tokenInfo.decimals)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center space-x-2">
                    {tokenInfo.paused ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Paused
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                    {tokenInfo.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Contract Address</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                    {formatAddress(tokenAddress)}
                  </code>
                  <Button
                    onClick={handleCopyAddress}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(getExplorerUrl(chainId, tokenAddress), '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Address copied to clipboard!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load token information</p>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Section */}
      {tokenInfo && !tokenInfo.paused && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Transfer Tokens</span>
            </CardTitle>
            <CardDescription>
              Transfer {tokenInfo.symbol} tokens to another address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <Input
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatBalance(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleTransfer}
              disabled={transferLoading || !transferTo || !transferAmount}
              className="w-full"
            >
              {transferLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {tokenInfo?.paused && (
        <Card>
          <CardContent className="text-center py-8">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This token has been paused by the owner. Transfers are temporarily disabled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}