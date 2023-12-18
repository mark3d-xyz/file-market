import { makeAutoObservable } from 'mobx'
import { getAddress } from 'viem'

import { OrderStatus, type TokensResponse } from '../../../swagger/Api'
import { type NFTCardProps } from '../../components/MarketCard/NFTCard/NFTCard'
import { gradientPlaceholderImg } from '../../UIkit'
import { type ComboBoxOption } from '../../UIkit/Form/Combobox'
import { getHttpLinkFromIpfsString } from '../../utils/nfts/getHttpLinkFromIpfsString'
import { getProfileImageUrl } from '../../utils/nfts/getProfileImageUrl'
import { reduceAddress } from '../../utils/nfts/reduceAddress'
import { type IActivateDeactivate, type IStoreRequester, type RequestContext, storeRequest, storeReset } from '../../utils/store'
import { lastItem } from '../../utils/structs'
import { type CurrentBlockChainStore } from '../CurrentBlockChain/CurrentBlockChainStore'
import { type ErrorStore } from '../Error/ErrorStore'

export class CollectionAndTokenListStore implements IActivateDeactivate<[string]>, IStoreRequester {
  errorStore: ErrorStore
  currentBlockChainStore: CurrentBlockChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  address = ''

  data: TokensResponse = {
    collectionsTotal: 0,
    tokensTotal: 0,
  }

  constructor({ errorStore, currentBlockChainStore }: { errorStore: ErrorStore, currentBlockChainStore: CurrentBlockChainStore }) {
    this.errorStore = errorStore
    this.currentBlockChainStore = currentBlockChainStore
    makeAutoObservable(this, {
      errorStore: false,
      currentBlockChainStore: false,
    })
  }

  setData(data: TokensResponse) {
    this.data = data
  }

  addData(data: TokensResponse) {
    if (!this.data.collections) {
      this.data.collections = []
    }
    this.data.collections.push(...(data.collections ?? []))
    this.data.collectionsTotal = data.collectionsTotal

    if (!this.data.tokens) {
      this.data.tokens = []
    }
    this.data.tokens.push(...(data.tokens ?? []))
    this.data.tokensTotal = data.tokensTotal
  }

  private request() {
    storeRequest(
      this,
      this.currentBlockChainStore.api.tokens.tokensDetail(this.address, {
        tokenLimit: 10,
      }),
      data => { this.setData(data) },
    )
  }

  requestMoreTokens() {
    const token = lastItem(this.data.tokens ?? [])
    storeRequest(
      this,
      this.currentBlockChainStore.api.tokens.tokensDetail(this.address, {
        lastTokenId: token?.token?.tokenId,
        lastTokenCollectionAddress: token?.token?.collectionAddress,
        tokenLimit: 10,
      }),
      (data) => { this.addData(data) },
    )
  }

  activate(address: string): void {
    this.isActivated = true
    this.address = address
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
    const tokenFind = this.data.tokens?.[index]
    console.log(tokenFind)
    if (tokenFind?.token) tokenFind.token.likeCount = tokenFind.token.likeCount !== undefined ? tokenFind.token.likeCount + 1 : 1
  }

  get hasMoreData() {
    const { tokens = [], tokensTotal = 0 } = this.data

    return tokens.length < tokensTotal
  }

  get nftCards(): Array<Omit<NFTCardProps, 'onFlameSuccess'>> {
    if (!this.data.tokens) return []

    return this.data.tokens.map(({ token, order }) => ({
      collectionName: token?.collectionName ?? '',
      imageURL: token?.image ? getHttpLinkFromIpfsString(token?.image) : gradientPlaceholderImg,
      title: token?.name ?? '—',
      categories: token?.categories?.[0],
      likesCount: token?.likeCount,
      tokenFullId: {
        collectionAddress: token?.collectionAddress ?? '',
        tokenId: token?.tokenId ?? '',
      },
      user: {
        img: !!token?.ownerProfile?.avatarUrl
          ? getHttpLinkFromIpfsString(token?.ownerProfile?.avatarUrl ?? '')
          : getProfileImageUrl(token?.owner ?? ''),
        address: reduceAddress(token?.ownerProfile?.name ?? token?.owner ?? ''),
        url: token?.ownerProfile?.username ?? token?.owner,
      },
      hiddenFileMeta: token?.hiddenFileMeta,
      button: {
        text: 'Go to page',
        link: `/collection/${this.currentBlockChainStore.chain?.name}/${token?.collectionAddress}/${token?.tokenId}`,
      },
      chainName: this.currentBlockChainStore.chain,
      chainImg: this.currentBlockChainStore.configChain?.imgGray,
      priceUsd: order?.statuses?.[0]?.status === OrderStatus.Created ? order?.priceUsd : undefined,
      price: order?.statuses?.[0]?.status === OrderStatus.Created ? order?.price : undefined,
    }))
  }

  get collectionMintOptions(): ComboBoxOption[] {
    if (!this.address || !this.data.collections) return []

    return this.data.collections
      // user is only allowed to mint into owned collections
      .filter(collection => collection.owner && getAddress(collection.owner) === getAddress(this.address))
      .map(collection => ({
        title: collection.name ?? '',
        id: collection.address ?? '',
      }))
  }
}
