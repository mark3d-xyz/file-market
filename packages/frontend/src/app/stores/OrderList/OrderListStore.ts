import { makeAutoObservable } from 'mobx'

import { type OrdersAllActiveResponse, OrderStatus } from '../../../swagger/Api'
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

/**
 * Stores only ACTIVE order state.
 * Does not listen for updates, need to reload manually.
 */
export class OpenOrderListStore implements IStoreRequester, IActivateDeactivate {
  errorStore: ErrorStore
  currentBlockChainStore: CurrentBlockChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = true
  isActivated = false

  data: OrdersAllActiveResponse = {
    total: 0,
  }

  constructor({ errorStore, currentBlockChainStore }: { errorStore: ErrorStore, currentBlockChainStore: CurrentBlockChainStore }) {
    this.errorStore = errorStore
    this.currentBlockChainStore = currentBlockChainStore
    makeAutoObservable(this, {
      errorStore: false,
      currentBlockChainStore: false,
    })
  }

  setData(data: OrdersAllActiveResponse) {
    this.data = data
    console.log(data)
  }

  addData(data: OrdersAllActiveResponse) {
    if (!this.data.items) {
      this.data.items = []
    }
    this.data.items.push(...(data?.items ?? []))
    this.data.total = data.total
  }

  private request() {
    storeRequest(
      this,
      this.currentBlockChainStore.api.orders.allActiveList({ limit: 10 }),
      (data) => { this.setData(data) },
    )
  }

  requestMore() {
    const lastOrderId = lastItem(this.data.items ?? [])?.order?.id
    storeRequest(
      this,
      this.currentBlockChainStore.api.orders.allActiveList({ lastOrderId, limit: 10 }),
      (data) => { this.addData(data) },
    )
  }

  activate(): void {
    this.isActivated = true
    this.request()
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
    const tokenFind = this.data.items?.[index]
    console.log(tokenFind)
    if (tokenFind?.token) tokenFind.token.likeCount = tokenFind.token.likeCount !== undefined ? tokenFind.token.likeCount + 1 : 0
  }

  get hasMoreData() {
    const { total = 0, items = [] } = this.data

    return items.length < total
  }

  get nftCards() {
    if (!this.data.items) return []

    return this.data.items
      .filter(({ order }) => order?.statuses?.[0]?.status === OrderStatus.Created)
      .map(({ token, order }) => ({
        collectionName: token?.collectionName ?? '',
        categories: token?.categories?.[0],
        likesCount: token?.likeCount,
        hiddenFileMeta: token?.hiddenFileMeta,
        imageURL: token?.image ? getHttpLinkFromIpfsString(token.image) : gradientPlaceholderImg,
        title: token?.name ?? '—',
        tokenFullId: {
          collectionAddress: token?.collectionAddress ?? '',
          tokenId: token?.tokenId ?? '',
        },
        user: {
          img: getProfileImageUrl(token?.owner ?? ''),
          address: reduceAddress(token?.owner ?? ''),
        },
        button: {
          link: `/collection/${this.currentBlockChainStore.chain?.name}/${token?.collectionAddress}/${token?.tokenId}`,
          text: 'View & Buy',
        },
        priceUsd: order?.priceUsd,
        price: order?.price,
        chainName: this.currentBlockChainStore.chain?.name,
        chainImg: this.currentBlockChainStore.configChain?.imgGray,
      }))
  }
}
