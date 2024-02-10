import { makeAutoObservable } from 'mobx'
import { type Chain } from 'wagmi'

import multichainConfig from '../../../../../../config/multiChainConfig.json'
import { Api } from '../../../swagger/Api'
import { type IMultiChainConfig } from '../../config/multiChainConfigType'
import {
  type IActivateDeactivate,
  type IStoreRequester,
  type RequestContext,
  storeReset,
} from '../../utils/store'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

export class CurrentBlockChainStore implements IStoreRequester, IActivateDeactivate {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = true
  isActivated = false

  chainId?: number
  chainNameByPage?: string

  constructor({ errorStore, multiChainStore }: { errorStore: ErrorStore, multiChainStore: MultiChainStore }) {
    this.errorStore = errorStore
    this.multiChainStore = multiChainStore
    const multiChains: IMultiChainConfig[] = multichainConfig as IMultiChainConfig[]
    const data = multiChains?.filter((item) => (item.chain.testnet === true) === !import.meta.env.VITE_IS_MAINNET)
    const defaultChain = data?.find(item => (item.isDefault === true))
    this.chainId = defaultChain ? defaultChain.chain.id : data?.[0].chain.id
    makeAutoObservable(this, {
      errorStore: false,
      multiChainStore: false,
    })
  }

  setCurrentBlockChain(chainId: number) {
    if (chainId !== this.chainId) this.chainId = chainId
  }

  setCurrentBlockChainByPage(chainName: string | undefined) {
    if (chainName !== this.chainNameByPage) this.chainNameByPage = chainName
  }

  private request() {
    const multiChains: IMultiChainConfig[] = multichainConfig as IMultiChainConfig[]
    const data = multiChains?.filter((item) => (item.chain.testnet === true) === !import.meta.env.VITE_IS_MAINNET)
    const defaultChain = data?.find(item => (item.isDefault === true))
    this.chainId = defaultChain ? defaultChain.chain.id : data?.[0].chain.id
  }

  activate(): void {
    console.log('activate CurrentBlockChainStore')
    this.isActivated = true
    this.request()
  }

  deactivate(): void {
    console.log('deactivate CurrentBlockChainStore')
    this.reset()
    this.isActivated = false
  }

  reset(): void {
    storeReset(this)
  }

  get baseUrl(): string | undefined {
    const chain = this.multiChainStore.data?.find(item => (item.chain.id === this.chainId))

    return chain?.baseUrl
  }

  get api() {
    return new Api({ baseUrl: this.baseUrl ?? '/api' })
  }

  get chain(): Chain | undefined {
    return this.multiChainStore.data?.find(item => item.chain.id === this.chainId)?.chain
  }

  get configChain(): IMultiChainConfig | undefined {
    return this.multiChainStore.data?.find(item => item.chain.id === this.chainId)
  }

  get configByChainName(): IMultiChainConfig | undefined {
    return this.multiChainStore.data?.find(item => item.chain.name === this.chainNameByPage)
  }
}
