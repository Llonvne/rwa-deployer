// Factory addresses for different networks
export const FACTORY_ADDRESSES: Record<number, string | undefined> = {
  11155111: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_SEPOLIA, // Sepolia testnet
  1: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_MAINNET, // Ethereum mainnet
  137: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_POLYGON, // Polygon
  56: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BSC, // Binance Smart Chain
}

// Get factory address for the current chain
export const getFactoryAddress = (chainId: number): string | undefined => {
  return FACTORY_ADDRESSES[chainId]
}