import { makeAutoObservable } from 'mobx'

import { type Api, type CollectionData } from '../../../swagger/Api'
import { gradientPlaceholderImg } from '../../UIkit'
import { getHttpLinkFromIpfsString } from '../../utils/nfts/getHttpLinkFromIpfsString'
import { getProfileImageUrl } from '../../utils/nfts/getProfileImageUrl'
import { reduceAddress } from '../../utils/nfts/reduceAddress'
import {
  type IActivateDeactivate,
  type IStoreRequester,
  type RequestContext,
  storeRequest,
  storeReset,
} from '../../utils/store'
import { lastItem } from '../../utils/structs'
import { type CurrentBlockChainStore } from '../CurrentBlockChain/CurrentBlockChainStore'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

export class CollectionTokenListStore implements IActivateDeactivate<[string, string]>, IStoreRequester {
  errorStore: ErrorStore
  currentBlockChainStore: CurrentBlockChainStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  data: CollectionData = {
    total: 0,
  }

  api?: Api<unknown>

  collectionAddress = ''

  isCustomApi: boolean = true
  constructor({ errorStore, currentBlockChainStore, multiChainStore }: {
    errorStore: ErrorStore
    currentBlockChainStore: CurrentBlockChainStore
    multiChainStore: MultiChainStore
  }) {
    this.errorStore = errorStore
    this.currentBlockChainStore = currentBlockChainStore
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
      currentBlockChainStore: false,
      multiChainStore: false,
    })
  }

  setData(data: CollectionData) {
    this.data = data || {}
  }

  addData(data: CollectionData) {
    if (!this.data.tokens) {
      this.data.tokens = []
    }
    this.data.tokens.push(...(data?.tokens ?? []))
    this.data.total = data.total
  }

  private request(api?: Api<unknown>) {
    if (!api) return
    storeRequest(
      this,
      api.collections.fullDetail(this.collectionAddress, { limit: 10 }),
      (data) => { this.setData(data) },
    )
  }

  requestMore() {
    const lastTokenId = lastItem(this.data.tokens ?? [])?.tokenId
    storeRequest(
      this,
      this.currentBlockChainStore.api.collections.fullDetail(this.collectionAddress, { lastTokenId, limit: 10 }),
      (data) => { this.addData(data) },
    )
  }

  activate(collectionAddress: string, chainName: string): void {
    this.isActivated = true
    this.collectionAddress = collectionAddress
    this.api = this.multiChainStore.getApiByName(chainName)
    this.request(this.api)
  }

  deactivate(): void {
    this.reset()
    this.isActivated = false
  }

  reset(): void {
    storeReset(this)
  }

  reload(): void {
    this.request()
  }

  increaseLikeCount(index: number) {
    const tokenFind = this.data.tokens?.[index]
    console.log(tokenFind)
    if (tokenFind) tokenFind.likeCount = tokenFind.likeCount !== undefined ? tokenFind.likeCount + 1 : 1
  }

  get hasMoreData() {
    const { total = 0, tokens = [] } = this.data

    return tokens.length < total
  }

  get nftCards() {
    if (!this.data.tokens) return []

    return this.data.tokens.map((token) => ({
      collectionName: this.data.collection?.name ?? '',
      imageURL: token.image ? getHttpLinkFromIpfsString(token.image) : gradientPlaceholderImg,
      title: token.name ?? '—',
      likesCount: token.likeCount,
      user: {
        img: !!token.ownerProfile?.avatarUrl
          ? getHttpLinkFromIpfsString(token.ownerProfile?.avatarUrl ?? '')
          : getProfileImageUrl(token.owner ?? ''),
        address: reduceAddress(token.ownerProfile?.name ?? token.owner ?? ''),
        url: token.ownerProfile?.username ?? token.owner,
      },
      button: {
        link: `/collection/${this.currentBlockChainStore.chain?.name}/${token.collectionAddress}/${token.tokenId}`,
        text: 'Go to page',
      },
      tokenFullId: {
        collectionAddress: token?.collectionAddress ?? '',
        tokenId: token?.tokenId ?? '',
      },
      hiddenFile: token.hiddenFileMeta,
      hiddenFileMeta: token.hiddenFileMeta,
      chainName: this.currentBlockChainStore.chain?.name,
      chainImg: this.currentBlockChainStore.configChain?.imgGray,
      onFlameSuccess: () => {
        console.log('SUCCCCCCCESESESE')
        const tokenFind = this.data.tokens?.find(item => item.tokenId === token.tokenId && item.collectionAddress === token.collectionAddress)
        if (tokenFind) tokenFind.likeCount = tokenFind.likeCount !== undefined ? tokenFind.likeCount++ : 0
      },
    }))
  }
}
