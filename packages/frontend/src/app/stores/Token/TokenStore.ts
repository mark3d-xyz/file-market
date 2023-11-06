import { makeAutoObservable } from 'mobx'

import { type Api, type Token } from '../../../swagger/Api'
import { type TokenFullId } from '../../processing/types'
import { type IActivateDeactivate, type IStoreRequester, type RequestContext, storeRequest, storeReset } from '../../utils/store'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

/**
 * Stores token state, referenced by the TokenFullId
 * Does not listen for updates, need to reload manually.
 */
export class TokenStore implements IStoreRequester,
  IActivateDeactivate<[string, string, string]> {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  data?: Token = undefined
  tokenFullId?: TokenFullId = undefined
  api?: Api<unknown>

  isCustomApi: boolean = true

  constructor({ errorStore, multiChainStore }: {
    errorStore: ErrorStore
    multiChainStore: MultiChainStore
  }) {
    this.errorStore = errorStore
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
      multiChainStore: false,
    })
  }

  private request(tokenFullId: TokenFullId, api?: Api<unknown>) {
    if (!api) return
    storeRequest<Token>(
      this,
      api.tokens.tokensDetail2(tokenFullId?.collectionAddress, tokenFullId?.tokenId),
      resp => {
        this.data = resp
      })
  }

  setData(token: Token | undefined) {
    this.data = token
  }

  activate(collectionAddress: string, tokenId: string, chainName: string): void {
    this.isActivated = true
    this.tokenFullId = { collectionAddress, tokenId }
    this.api = this.multiChainStore.getApiByName(chainName)
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
    console.log('Reload')
  }

  get creatorName() {
    return this.data?.creatorProfile?.name ?? this.data?.creator
  }

  get creatorHasImg() {
    return !!this.data?.creatorProfile?.avatarUrl
  }

  get creatorImg() {
    return this.data?.creatorProfile?.avatarUrl ?? this.data?.creator
  }

  get ownerName() {
    return this.data?.ownerProfile?.name ?? this.data?.owner
  }

  get ownerHasImg() {
    console.log(this.data?.ownerProfile?.avatarUrl)
    console.log(!!this.data?.ownerProfile?.avatarUrl)

    return !!this.data?.ownerProfile?.avatarUrl
  }

  get ownerImg() {
    return this.data?.ownerProfile?.avatarUrl ?? this.data?.owner
  }
}
