import dayjs from 'dayjs'
import { makeAutoObservable } from 'mobx'

import { styled } from '../../../styles'
import {
  type OrderStatusInfo,
  type TransfersResponseV2,
  type TransferWithData,
} from '../../../swagger/Api'
import { type ITableRow } from '../../components/Table/TableBuilder'
import ethIcon from '../../pages/ProfilePage/img/EthereumIcon.svg'
import { Badge } from '../../UIkit'
import { getHttpLinkFromIpfsString } from '../../utils/nfts/getHttpLinkFromIpfsString'
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
import { type MultiChainStore } from '../MultiChain/MultiChainStore'

const getLatestStatusTimestamp = (statuses?: OrderStatusInfo[]) => {
  if (!statuses) return 0

  return statuses.reduce(
    (acc, value) => ((value.timestamp ?? 0) > acc ? value.timestamp ?? 0 : acc),
    -Infinity,
  )
}

const PriceContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
})

const Price = styled('div')

const EthImg = styled('img', {
  width: 8,
  height: 12,
  objectFit: 'contain',
})

const convertTransferToTableRows = (target: 'incoming' | 'outgoing', multiChainStore: MultiChainStore | undefined) => {
  const eventOptions =
    target === 'incoming' ? ['Receive', 'Buy'] : ['Send', 'Sale']

  return (transfer: TransferWithData): ITableRow => {
    const chain = multiChainStore
      ?.getChainById(Number(transfer.collection?.chainId))?.chain

    return ({
      cells: [
        {
          columnName: 'Event',
          value:
            (transfer.order?.id ?? 0) === 0 ? eventOptions[0] : eventOptions[1],
          cellAttributes: {
            css: {
              flexGrow: 0.5,
            },
          },
        },
        {
          columnName: 'Object',
          value: (
            <Badge
              small
              wrapperProps={{ css: { padding: 0 } }}
              image={{
                borderRadius: 'roundedSquare',
                url: getHttpLinkFromIpfsString(transfer.collection?.image ?? ''),
              }}
              content={{
                value: reduceAddress(transfer.collection?.owner ?? '—'),
                title: transfer.collection?.name ?? '—',
              }}
            />
          ),
          cellAttributes: {
            css: {
              flexGrow: 1.5,
            },
          },
        },
        {
          columnName: 'From',
          value: reduceAddress(transfer.transfer?.from ?? '—'),
        },
        {
          columnName: 'To',
          value: reduceAddress(transfer.transfer?.to ?? '—'),
        },
        {
          columnName: 'Price',
          value: (
            <PriceContainer>
              <Price>
                {transfer.order?.price !== undefined
                  ? formatCurrency(
                    transfer.order.price,
                    chain,
                  )
                  : '—'
                }
              </Price>
              <EthImg src={ethIcon} />
            </PriceContainer>
          ),
        },
        {
          columnName: 'Date',
          value:
            transfer.order?.statuses?.length
              ? dayjs(getLatestStatusTimestamp(transfer.order?.statuses)).format(
                'MMM D[,] YYYY [at] HH[:]mm',
              )
              : '—',
        },
      ],
      additionalData: {
        linkToPage: chain ? `/collection/${chain?.name}/${transfer.collection?.address}/${transfer.token?.tokenId}` : '/',
      },
    })
  }
}

export class TransfersHistoryStore implements IActivateDeactivate<[string]>, IStoreRequester {
  errorStore: ErrorStore
  currentBlockChainStore: CurrentBlockChainStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  data: TransfersResponseV2 = {
    incomingTotal: 0,
    outgoingTotal: 0,
  }

  collectionAddress = ''

  constructor({
    errorStore,
    currentBlockChainStore,
    multiChainStore,
  }: {
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
    storeRequest(
      this,
      this.currentBlockChainStore.api.v2.transfersHistoryDetail(this.collectionAddress, { outgoingLimit: 10, incomingLimit: 10 }),
      (data) => { this.setData(data) },
    )
  }

  requestMore() {
    const lastIncomingTransferId = lastItem(this.data.incoming ?? [])?.transfer?.id
    const lastOutgoingTransferId = lastItem(this.data.outgoing ?? [])?.transfer?.id

    storeRequest(
      this,
      this.currentBlockChainStore.api.v2.transfersHistoryDetail(this.collectionAddress, {
        lastIncomingTransferId,
        lastOutgoingTransferId,
        outgoingLimit: 10,
        incomingLimit: 10,
      }),
      (data) => { this.addData(data) },
    )
  }

  activate(collectionAddress: string): void {
    this.isActivated = true
    this.collectionAddress = collectionAddress
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

  get hasMoreData() {
    const { incoming = [], incomingTotal = 0, outgoing = [], outgoingTotal = 0 } = this.data

    return incoming.length < incomingTotal || outgoing.length < outgoingTotal
  }

  get total() {
    const { incomingTotal = 0, outgoingTotal = 0 } = this.data

    return incomingTotal + outgoingTotal
  }

  get tableRows(): ITableRow[] {
    const { incoming = [], outgoing = [] } = this.data

    if (!incoming.length && !outgoing.length) {
      return []
    }

    const incomingRows = incoming.map<ITableRow>(
      convertTransferToTableRows('incoming', this.multiChainStore),
    )
    const outgoingRows = outgoing.map<ITableRow>(
      convertTransferToTableRows('outgoing', this.multiChainStore),
    )

    return incomingRows.concat(outgoingRows)
  }
}
