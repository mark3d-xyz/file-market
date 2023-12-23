import { parseUnits } from 'viem'

export const fee = +import.meta.env.VITE_MARKETPLACE_FEE
export const isMainnet = import.meta.env.VITE_IS_MAINNET

export const mark3dConfig = {
  externalLink: 'https://filemarket.xyz/',
  transferTimeout: 24 * 60 * 60 * 1000,
  fileBunniesPrice: isMainnet ? parseUnits('12.0', 18) : parseUnits('0.01', 18),
} as const
