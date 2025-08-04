'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, Factory, Coins, FileText } from 'lucide-react'
import { useAccount } from 'wagmi'
import { BrowserProvider } from 'ethers'
import { ContractDeployer, DeploymentProgress, RWATokenParams } from '@/lib/contract-deployment'

type DeploymentStep = 'factory' | 'token' | 'review' | 'deploy'

interface DeploymentState {
  factoryAddress: string
  factoryDeploymentFee: string
  tokenParams: RWATokenParams
  deploymentInProgress: boolean
  deploymentProgress: DeploymentProgress | null
  deployedContracts: {
    factory?: string
    token?: string
  }
}

const ASSET_CATEGORIES = [
  'Real Estate',
  'Commodities',
  'Art & Collectibles',
  'Equipment & Machinery',
  'Intellectual Property',
  'Securities',
  'Other'
]

export function DeploymentWizard() {
  const { isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('factory')
  const [state, setState] = useState<DeploymentState>({
    factoryAddress: '',
    factoryDeploymentFee: '0.001',
    tokenParams: {
      name: '',
      symbol: '',
      decimals: 18,
      initialSupply: '1000000',
      assetType: '',
      assetLocation: '',
      assetValue: '100000',
      category: 'Real Estate'
    },
    deploymentInProgress: false,
    deploymentProgress: null,
    deployedContracts: {}
  })

  const steps = [
    { id: 'factory', title: 'Factory Setup', icon: Factory, description: 'Deploy or configure RWA factory' },
    { id: 'token', title: 'Token Configuration', icon: Coins, description: 'Configure your RWA token' },
    { id: 'review', title: 'Review', icon: FileText, description: 'Review deployment details' },
    { id: 'deploy', title: 'Deploy', icon: CheckCircle, description: 'Deploy your contracts' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as DeploymentStep)
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as DeploymentStep)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'factory':
        return state.factoryAddress || state.factoryDeploymentFee
      case 'token':
        return state.tokenParams.name && state.tokenParams.symbol && state.tokenParams.assetType
      case 'review':
        return true
      default:
        return false
    }
  }

  const deployFactory = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }

    setState(prev => ({ ...prev, deploymentInProgress: true }))

    try {
      const provider = new BrowserProvider(window.ethereum)
      const deployer = new ContractDeployer(provider)

      const result = await deployer.deployRWAFactory(
        state.factoryDeploymentFee,
        (progress) => {
          setState(prev => ({ ...prev, deploymentProgress: progress }))
        }
      )

      if (result.success && result.contractAddress) {
        const contractAddress = result.contractAddress
        setState(prev => ({
          ...prev,
          factoryAddress: contractAddress,
          deployedContracts: { ...prev.deployedContracts, factory: contractAddress },
          deploymentInProgress: false
        }))
        alert('Factory deployed successfully!')
      } else {
        alert(`Factory deployment failed: ${result.error}`)
        setState(prev => ({ ...prev, deploymentInProgress: false }))
      }
    } catch (error) {
      console.error('Factory deployment error:', error)
      alert('Factory deployment failed')
      setState(prev => ({ ...prev, deploymentInProgress: false }))
    }
  }

  const deployToken = async () => {
    if (!state.factoryAddress) {
      alert('Please deploy or set a factory address first')
      return
    }

    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }

    setState(prev => ({ ...prev, deploymentInProgress: true }))

    try {
      const provider = new BrowserProvider(window.ethereum)
      const deployer = new ContractDeployer(provider)

      const result = await deployer.deployRWAToken(
        state.factoryAddress,
        state.tokenParams,
        (progress) => {
          setState(prev => ({ ...prev, deploymentProgress: progress }))
        }
      )

      if (result.success && result.contractAddress) {
        const contractAddress = result.contractAddress
        setState(prev => ({
          ...prev,
          deployedContracts: { ...prev.deployedContracts, token: contractAddress },
          deploymentInProgress: false
        }))
        alert('RWA Token deployed successfully!')
      } else {
        alert(`Token deployment failed: ${result.error}`)
        setState(prev => ({ ...prev, deploymentInProgress: false }))
      }
    } catch (error) {
      console.error('Token deployment error:', error)
      alert('Token deployment failed')
      setState(prev => ({ ...prev, deploymentInProgress: false }))
    }
  }

  const deployTestUSDT = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }

    setState(prev => ({ ...prev, deploymentInProgress: true }))

    try {
      const provider = new BrowserProvider(window.ethereum)
      const deployer = new ContractDeployer(provider)

      const result = await deployer.deployTestUSDT(
        (progress) => {
          setState(prev => ({ ...prev, deploymentProgress: progress }))
        }
      )

      if (result.success && result.contractAddress) {
        alert(`TestUSDT deployed successfully at: ${result.contractAddress}`)
        setState(prev => ({ ...prev, deploymentInProgress: false }))
      } else {
        alert(`TestUSDT deployment failed: ${result.error}`)
        setState(prev => ({ ...prev, deploymentInProgress: false }))
      }
    } catch (error) {
      console.error('TestUSDT deployment error:', error)
      alert('TestUSDT deployment failed')
      setState(prev => ({ ...prev, deploymentInProgress: false }))
    }
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Deployment Wizard</CardTitle>
          <CardDescription>Connect your wallet to start deploying contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please connect your wallet to use the deployment wizard.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'factory' && <FactoryStep state={state} setState={setState} onDeployFactory={deployFactory} onDeployTestUSDT={deployTestUSDT} />}
      {currentStep === 'token' && <TokenStep state={state} setState={setState} />}
      {currentStep === 'review' && <ReviewStep state={state} />}
      {currentStep === 'deploy' && <DeployStep state={state} onDeployToken={deployToken} />}

      {/* Deployment Progress */}
      {state.deploymentProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Deployment Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {state.deploymentProgress.stage === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : state.deploymentProgress.stage === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
                <span className="font-medium">{state.deploymentProgress.message}</span>
              </div>
              
              {state.deploymentProgress.txHash && (
                <p className="text-sm text-gray-600">
                  Transaction: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {state.deploymentProgress.txHash.slice(0, 10)}...{state.deploymentProgress.txHash.slice(-10)}
                  </code>
                </p>
              )}

              {state.deploymentProgress.contractAddress && (
                <p className="text-sm text-gray-600">
                  Contract: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {state.deploymentProgress.contractAddress}
                  </code>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || state.deploymentInProgress}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep !== 'deploy' && (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || state.deploymentInProgress}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

function FactoryStep({ 
  state, 
  setState, 
  onDeployFactory, 
  onDeployTestUSDT 
}: { 
  state: DeploymentState
  setState: React.Dispatch<React.SetStateAction<DeploymentState>>
  onDeployFactory: () => void
  onDeployTestUSDT: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Factory Configuration</CardTitle>
        <CardDescription>
          Deploy a new RWA factory or use an existing one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Option 1: Deploy New Factory</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deployment Fee (ETH)
              </label>
              <Input
                type="number"
                step="0.001"
                value={state.factoryDeploymentFee}
                onChange={(e) => setState(prev => ({ ...prev, factoryDeploymentFee: e.target.value }))}
                placeholder="0.001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fee required to deploy new RWA tokens via this factory
              </p>
            </div>
            <Button
              onClick={onDeployFactory}
              disabled={state.deploymentInProgress}
              className="w-full"
            >
              {state.deploymentInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Deploy New Factory'
              )}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Option 2: Use Existing Factory</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factory Contract Address
            </label>
            <Input
              value={state.factoryAddress}
              onChange={(e) => setState(prev => ({ ...prev, factoryAddress: e.target.value }))}
              placeholder="0x..."
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Optional: Deploy Test USDT</h4>
          <p className="text-sm text-gray-600 mb-4">
            Deploy a test USDT contract for testing purposes on Sepolia testnet
          </p>
          <Button
            onClick={onDeployTestUSDT}
            disabled={state.deploymentInProgress}
            variant="outline"
            className="w-full"
          >
            {state.deploymentInProgress ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              'Deploy Test USDT'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TokenStep({ 
  state, 
  setState 
}: { 
  state: DeploymentState
  setState: React.Dispatch<React.SetStateAction<DeploymentState>>
}) {
  const updateTokenParam = (field: keyof RWATokenParams, value: string | number) => {
    setState(prev => ({
      ...prev,
      tokenParams: { ...prev.tokenParams, [field]: value }
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RWA Token Configuration</CardTitle>
        <CardDescription>
          Configure your Real World Asset token parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name *
            </label>
            <Input
              value={state.tokenParams.name}
              onChange={(e) => updateTokenParam('name', e.target.value)}
              placeholder="e.g., Manhattan Real Estate Token"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Symbol *
            </label>
            <Input
              value={state.tokenParams.symbol}
              onChange={(e) => updateTokenParam('symbol', e.target.value.toUpperCase())}
              placeholder="e.g., MRET"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimals
            </label>
            <Input
              type="number"
              min="0"
              max="18"
              value={state.tokenParams.decimals}
              onChange={(e) => updateTokenParam('decimals', parseInt(e.target.value) || 18)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Supply
            </label>
            <Input
              type="number"
              value={state.tokenParams.initialSupply}
              onChange={(e) => updateTokenParam('initialSupply', e.target.value)}
              placeholder="1000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type *
            </label>
            <Input
              value={state.tokenParams.assetType}
              onChange={(e) => updateTokenParam('assetType', e.target.value)}
              placeholder="e.g., Commercial Property"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Location
            </label>
            <Input
              value={state.tokenParams.assetLocation}
              onChange={(e) => updateTokenParam('assetLocation', e.target.value)}
              placeholder="e.g., 123 Main St, New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Value (USD)
            </label>
            <Input
              type="number"
              value={state.tokenParams.assetValue}
              onChange={(e) => updateTokenParam('assetValue', e.target.value)}
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={state.tokenParams.category}
              onChange={(e) => updateTokenParam('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ASSET_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewStep({ state }: { state: DeploymentState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Deployment</CardTitle>
        <CardDescription>
          Review your configuration before deploying
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Factory Configuration</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span className="font-medium">Factory Address:</span> {state.factoryAddress || 'Will be deployed'}</p>
            {!state.factoryAddress && (
              <p><span className="font-medium">Deployment Fee:</span> {state.factoryDeploymentFee} ETH</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Token Configuration</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span className="font-medium">Name:</span> {state.tokenParams.name}</p>
            <p><span className="font-medium">Symbol:</span> {state.tokenParams.symbol}</p>
            <p><span className="font-medium">Decimals:</span> {state.tokenParams.decimals}</p>
            <p><span className="font-medium">Initial Supply:</span> {state.tokenParams.initialSupply}</p>
            <p><span className="font-medium">Asset Type:</span> {state.tokenParams.assetType}</p>
            <p><span className="font-medium">Asset Location:</span> {state.tokenParams.assetLocation}</p>
            <p><span className="font-medium">Asset Value:</span> ${state.tokenParams.assetValue}</p>
            <p><span className="font-medium">Category:</span> {state.tokenParams.category}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DeployStep({ 
  state, 
  onDeployToken 
}: { 
  state: DeploymentState
  onDeployToken: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy Contracts</CardTitle>
        <CardDescription>
          Deploy your RWA token using the configured factory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!state.factoryAddress ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Please deploy or configure a factory first</p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Button
              onClick={onDeployToken}
              disabled={state.deploymentInProgress}
              size="lg"
              className="w-full"
            >
              {state.deploymentInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying Token...
                </>
              ) : (
                'Deploy RWA Token'
              )}
            </Button>

            {state.deployedContracts.token && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Token Deployed Successfully!</p>
                <p className="text-sm text-green-700 mt-1 font-mono">
                  {state.deployedContracts.token}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}