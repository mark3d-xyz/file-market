import { makeAutoObservable } from 'mobx'

import { type Api, type CollectionData, OrderStatus } from '../../../swagger/Api'
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

export class CollectionTokenListStore implements IActivateDeactivate<[string, number]>, IStoreRequester {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  chainId?: number = undefined

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
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
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
    if (!this.api) return

    const lastTokenId = lastItem(this.data.tokens ?? [])?.token?.tokenId
    storeRequest(
      this,
      this.api.collections.fullDetail(this.collectionAddress, { lastTokenId, limit: 10 }),
      (data) => { this.addData(data) },
    )
  }

  activate(collectionAddress: string, chainId: number): void {
    this.isActivated = true
    this.collectionAddress = collectionAddress

    console.log(chainId)

    this.api = this.multiChainStore.getApiById(chainId)
    this.request(this.api)

    this.chainId = chainId
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
    if (tokenFind?.token) tokenFind.token.likeCount = tokenFind?.token.likeCount !== undefined ? tokenFind.token.likeCount + 1 : 1
  }

  get hasMoreData() {
    const { total = 0, tokens = [] } = this.data

    return tokens.length < total
  }

  get nftCards() {
    if (!this.data.tokens) return []

    const config = this.multiChainStore.getChainById(this.chainId)

    return this.data.tokens.map(({ token, order }) => ({
      collectionName: this.data.collection?.name ?? '',
      imageURL: token?.image ? getHttpLinkFromIpfsString(token.image) : gradientPlaceholderImg,
      title: token?.name ?? '—',
      likesCount: token?.likeCount,
      categories: token?.categories?.[0],
      user: {
        img: !!token?.ownerProfile?.avatarUrl
          ? getHttpLinkFromIpfsString(token?.ownerProfile?.avatarUrl ?? '')
          : getProfileImageUrl(token?.owner ?? ''),
        address: reduceAddress(token?.ownerProfile?.name ?? token?.owner ?? ''),
        url: token?.ownerProfile?.username ?? token?.owner,
      },
      button: {
        link: `/collection/${config?.chain?.name}/${token?.collectionAddress}/${token?.tokenId}`,
        text: 'Go to page',
      },
      tokenFullId: {
        collectionAddress: token?.collectionAddress ?? '',
        tokenId: token?.tokenId ?? '',
      },
      hiddenFile: token?.hiddenFileMeta,
      hiddenFileMeta: token?.hiddenFileMeta,
      priceUsd: order?.statuses?.[0]?.status === OrderStatus.Created ? order?.priceUsd : undefined,
      price: order?.statuses?.[0]?.status === OrderStatus.Created ? order?.price : undefined,
      chain: config?.chain?.name,
      chainImg: config?.imgGray,
    }))
  }
}
