import { makeAutoObservable } from 'mobx'

import { type Api, type Order } from '../../../swagger/Api'
import { type TokenFullId } from '../../processing/types'
import { type IActivateDeactivate, type IStoreRequester, type RequestContext, storeRequest, storeReset } from '../../utils/store'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

/**
 * Stores only ACTIVE order state.
 * Does not listen for updates, need to reload manually.
 */
export class OrderStore implements IStoreRequester,
  IActivateDeactivate<[string, string, number]> {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  api?: Api<unknown>

  data?: Order = undefined
  tokenFullId?: TokenFullId = undefined

  isCustomApi: boolean = true

  constructor({ errorStore, multiChainStore }: { errorStore: ErrorStore, multiChainStore: MultiChainStore }) {
    this.errorStore = errorStore
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
      multiChainStore: false,
    })
  }

  private request(tokenFullId: TokenFullId, api?: Api<unknown>) {
    if (!api) return

    storeRequest<Order | null>(
      this,
      api.orders.ordersDetail2(tokenFullId?.collectionAddress, tokenFullId?.tokenId),
      resp => {
        if (resp === null) this.data = undefined
        else this.data = resp
      })
  }

  activate(collectionAddress: string, tokenId: string, chainId: number): void {
    this.isActivated = true
    this.tokenFullId = { collectionAddress, tokenId }
    this.api = this.multiChainStore.getApiById(chainId)
    this.request(this.tokenFullId, this.api)
  }

  deactivate(): void {
    this.reset()
    this.isActivated = false
  }

  reset(): void {
    storeReset(this)
  }

  reload(): void {
    if (this.tokenFullId) {
      this.request(this.tokenFullId, this.api)
    }
  }

  setData(data: Order | undefined) {
    this.data = data
  }
}
