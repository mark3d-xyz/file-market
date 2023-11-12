import { makeAutoObservable } from 'mobx'
import { type Chain } from 'wagmi'

import { type TransfersResponseV2, type TransferWithData } from '../../../swagger/Api'
import { type TransferCardProps } from '../../components/MarketCard/TransferCard'
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
import { formatCurrency } from '../../utils/web3/currency'
import { type CurrentBlockChainStore } from '../CurrentBlockChain/CurrentBlockChainStore'
import { type ErrorStore } from '../Error/ErrorStore'

export class UserTransferStore implements IActivateDeactivate<[string]>, IStoreRequester {
  errorStore: ErrorStore
  currentBlockChainStore: CurrentBlockChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  data: TransfersResponseV2 = {
    incomingTotal: 0,
    outgoingTotal: 0,
  }

  address = ''

  constructor({ errorStore, currentBlockChainStore }: { errorStore: ErrorStore, currentBlockChainStore: CurrentBlockChainStore }) {
    this.errorStore = errorStore
    this.currentBlockChainStore = currentBlockChainStore

    makeAutoObservable(this, {
      errorStore: false,
      currentBlockChainStore: false,
    })
  }

  setData(data: TransfersResponseV2) {
    this.data = data
  }

  addData(data: TransfersResponseV2) {
    if (!this.data.incoming) {
      this.data.incoming = []
    }
    this.data.incoming.push(...(data.incoming ?? []))
    this.data.incomingTotal = data.incomingTotal

    if (!this.data.outgoing) {
      this.data.outgoing = []
    }
    this.data.outgoing.push(...(data.outgoing ?? []))
    this.data.outgoingTotal = data.outgoingTotal
  }

  private request() {
    storeRequest<TransfersResponseV2>(
      this,
      this.currentBlockChainStore.api.v2.transfersDetail(this.address, { outgoingLimit: 10, incomingLimit: 10 }),
      (data) => { this.setData(data) },
    )
  }

  requestMore() {
    const lastOutgoingTransferId = lastItem(this.data.outgoing ?? [])?.transfer?.id
    const lastIncomingTransferId = lastItem(this.data.incoming ?? [])?.transfer?.id

    storeRequest<TransfersResponseV2>(
      this,
      this.currentBlockChainStore.api.v2.transfersDetail(this.address, {
        lastIncomingTransferId,
        lastOutgoingTransferId,
        outgoingLimit: 10,
        incomingLimit: 10,
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

  convertTransferToTransferCards(target: 'incoming' | 'outgoing', chain: Chain | undefined) {
    const eventOptions =
      target === 'incoming' ? ['Receiving', 'Buying'] : ['Sending', 'Selling']

    return (transfer: TransferWithData): TransferCardProps => ({
      status: transfer.order?.id === 0 ? eventOptions[0] : eventOptions[1],
      button: {
        link: `/collection/${chain?.name}/${transfer.collection?.address}/${transfer.token?.tokenId}`,
        text: 'Go to page',
      },
      tokenFullId: {
        collectionAddress: transfer?.collection?.address ?? '',
        tokenId: transfer?.token?.tokenId ?? '',
      },
      collectionName: transfer.collection?.name ?? '',
      imageURL: getHttpLinkFromIpfsString(transfer.token?.image ?? ''),
      title: transfer.token?.name ?? '',
      hiddenFileMeta: transfer.token?.hiddenFileMeta,
      user: {
        img: !!transfer.token?.ownerProfile?.avatarUrl
          ? getHttpLinkFromIpfsString(transfer.token?.ownerProfile?.avatarUrl ?? '')
          : getProfileImageUrl(transfer.token?.owner ?? ''),
        address: reduceAddress(transfer.token?.ownerProfile?.name ?? transfer.token?.owner ?? ''),
      },
      price: transfer.order?.price ? formatCurrency(transfer.order?.price, chain) : undefined,
    })
  }

  get hasMoreData() {
    const { incoming = [], incomingTotal = 0, outgoing = [], outgoingTotal = 0 } = this.data

    return incoming.length < incomingTotal || outgoing.length < outgoingTotal
  }

  get total() {
    const { incomingTotal = 0, outgoingTotal = 0 } = this.data

    return incomingTotal + outgoingTotal
  }

  get transferCards(): TransferCardProps[] {
    const { incoming = [], outgoing = [] } = this.data

    const incomingCards = incoming.map<TransferCardProps>(
      this.convertTransferToTransferCards('incoming', this.currentBlockChainStore.chain),
    )
    const outgoingCards = outgoing.map<TransferCardProps>(
      this.convertTransferToTransferCards('outgoing', this.currentBlockChainStore.chain),
    )

    return incomingCards.concat(outgoingCards)
  }
}
