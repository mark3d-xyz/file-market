import { makeAutoObservable } from 'mobx'

import { type IMultiChainConfig } from '../../config/multiChainConfigType'
import {
  type IActivateDeactivate,
  type RequestContext,
  storeReset,
} from '../../utils/store'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

export class ChainStore implements IActivateDeactivate<[string]> {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  selectedChain?: IMultiChainConfig = undefined

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = true
  isActivated = false

  constructor({ errorStore, multiChainStore }: { errorStore: ErrorStore, multiChainStore: MultiChainStore }) {
    this.errorStore = errorStore
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
      multiChainStore: false,
    })
  }

  activate(chainName?: string): void {
    if (!chainName) return

    this.isActivated = true
    this.selectedChain = this.multiChainStore.getChainByName(chainName)
  }

  deactivate(): void {
    this.reset()
    this.selectedChain = undefined
    this.isActivated = false
  }

  reset(): void {
    storeReset(this)
  }
}
