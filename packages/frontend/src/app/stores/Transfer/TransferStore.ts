import { makeAutoObservable } from 'mobx'

import { type Api, type Transfer, TransferStatus } from '../../../swagger/Api'
import { type IHiddenFilesTokenEventsListener } from '../../processing'
import { type TokenFullId } from '../../processing/types'
import { normalizeCounterId } from '../../processing/utils/id'
import { type IActivateDeactivate, type IStoreRequester, type RequestContext, storeRequest, storeReset } from '../../utils/store'
import { type BlockStore } from '../BlockStore/BlockStore'
import { type ErrorStore } from '../Error/ErrorStore'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'
import { type OrderStore } from '../Order/OrderStore'
import { type TokenStore } from '../Token/TokenStore'

/**
 * Stores only ACTIVE (i.e. created and not finished/cancelled) transfer state
 */
export class TransferStore implements IStoreRequester,
  IActivateDeactivate<[string, string, number]>, IHiddenFilesTokenEventsListener {
  errorStore: ErrorStore
  multiChainStore: MultiChainStore

  currentRequest?: RequestContext
  requestCount = 0
  isLoaded = false
  isLoading = false
  isActivated = false

  isWaitingForEvent: boolean = false
  isWaitingForReciept: boolean = false
  isWaitingForSocket: boolean = false

  data?: Transfer = undefined
  tokenFullId?: TokenFullId = undefined
  api?: Api<unknown>
  blockStore: BlockStore
  tokenStore: TokenStore
  orderStore: OrderStore

  isCustomApi: boolean = true

  isCanRedirectMint: boolean = false

  onTransferFinishedCall?: () => void
  onTransferPublicKeySetCall?: () => void
  onTransferDraftCall?: () => void
  onTransferCancelCall?: () => void
  constructor({ errorStore, blockStore, tokenStore, orderStore, multiChainStore }: {
    errorStore: ErrorStore
    blockStore: BlockStore
    tokenStore: TokenStore
    orderStore: OrderStore
    multiChainStore: MultiChainStore
  }) {
    this.errorStore = errorStore
    this.blockStore = blockStore
    this.tokenStore = tokenStore
    this.orderStore = orderStore
    this.multiChainStore = multiChainStore
    makeAutoObservable(this, {
      errorStore: false,
      blockStore: false,
      tokenStore: false,
      orderStore: false,
      multiChainStore: false,
    })
  }

  private request(tokenFullId: TokenFullId, api?: Api<unknown>, onSuccess?: () => void) {
    if (!api) return
    console.log('REQUESTT')
    storeRequest<Transfer | null>(
      this,
      api.transfers.transfersDetail2(tokenFullId?.collectionAddress, tokenFullId?.tokenId),
      resp => {
        this.data = resp ?? undefined
        if (resp?.block?.number) {
          this.blockStore.setReceiptBlock(BigInt(resp?.block?.number))
        }
        onSuccess?.()
      })
  }

  activate(collectionAddress: string, tokenId: string, chainId: number): void {
    this.isActivated = true
    this.tokenFullId = { collectionAddress, tokenId }
    this.api = this.multiChainStore.getApiById(chainId)
    this.request(this.tokenFullId, this.api)
    console.log('ACTIVVVVEAT')
  }

  deactivate(): void {
    this.reset()
    this.isActivated = false
  }

  reset(): void {
    storeReset(this)
  }

  reload(onSuccess?: () => void): void {
    if (this.tokenFullId) {
      this.request(this.tokenFullId, this.api, onSuccess)
    }
    console.log('Reload')
  }

  private checkData(tokenId: bigint, ifDataOk: (data: Transfer) => void) {
    if (this.data?.tokenId && normalizeCounterId(this.data?.tokenId) === normalizeCounterId(tokenId)) {
      ifDataOk(this.data)
    }
  }

  private checkActivation(tokenId: bigint, ifActivationOk: (tokenFullId: TokenFullId) => void) {
    if (
      this.isActivated &&
      this.tokenFullId &&
      normalizeCounterId(this.tokenFullId?.tokenId) === normalizeCounterId(tokenId)
    ) {
      ifActivationOk(this.tokenFullId)
    }
  }

  private checkExistStatus (status: TransferStatus): boolean {
    for (let i = 0; i < (this.data?.statuses?.length ?? 0); i++) {
      if (this.data?.statuses?.[i].status === status) return true
    }

    return false
  }

  setOnTransferFinished = (callBack: () => void) => {
    this.onTransferFinishedCall = callBack
  }

  setOnTransferPublicKeySet = (callBack: () => void) => {
    this.onTransferPublicKeySetCall = callBack
  }

  setOnTransferDrafted = (callBack: () => void) => {
    this.onTransferDraftCall = callBack
  }

  setOnTransferCancel = (callBack: () => void) => {
    this.onTransferCancelCall = callBack
  }

  setIsWaitingForEvent = (isWaiting: boolean) => {
    this.isWaitingForEvent = isWaiting
  }

  setIsWaitingReciept = (isWaiting: boolean) => {
    this.isWaitingForReciept = isWaiting
  }

  setIsWaitingSocket = (isWaiting: boolean) => {
    this.isWaitingForSocket = isWaiting
  }

  setBlockTransfer = (blockNumber?: bigint) => {
    if (this.data?.block) {
      this.data.block.number = Number(blockNumber)
      this.blockStore.setReceiptBlock(BigInt(blockNumber ?? 0))
    }
  }

  setIsCanRedirectMint = (isCanRedirectMint: boolean) => {
    this.isCanRedirectMint = isCanRedirectMint
  }

  setData = (transfer?: Transfer) => {
    this.data = transfer
    this.setIsWaitingForEvent(false)
    this.setBlockTransfer(BigInt(transfer?.block?.number ?? 0))
  }

  // We listen to only events related to transfer change, not transfer initialization
  // This store is supposed to be used only on existing transfers (TransferStatus.Drafted or TransferStatus.Created)

  onTransferInit(tokenId: bigint, from: string, to: string, blockNumber: number) {
    console.log('onTransferInit')
    if (this.checkExistStatus(TransferStatus.Created)) return
    this.checkActivation(tokenId, (tokenFullId) => {
      this.data = {
        collection: tokenFullId.collectionAddress,
        tokenId: tokenFullId.tokenId,
        from,
        to,
        statuses: [{
          status: TransferStatus.Created,
          timestamp: Date.now(),
        }],
      }
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(BigInt(blockNumber ?? 0))
    })
  }

  onTransferDraft(tokenId: bigint, from: string, blockNumber: bigint) {
    console.log('onTransferDraft')
    if (this.checkExistStatus(TransferStatus.Drafted)) return
    this.checkActivation(tokenId, (tokenFullId) => {
      this.data = {
        collection: tokenFullId.collectionAddress,
        tokenId: tokenFullId.tokenId,
        from,
        statuses: [{
          status: TransferStatus.Drafted,
          timestamp: Date.now(),
        }],
      }
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
      this.onTransferDraftCall?.()
    })
  }

  onTransferDraftCompletion(tokenId: bigint, to: string | null, blockNumber: bigint) {
    console.log('onTransferCompletion')
    this.checkData(tokenId, data => {
      data.to = to === null ? undefined : to
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
    })
  }

  onTransferPublicKeySet(tokenId: bigint, publicKeyHex: string, blockNumber: bigint) {
    console.log('onTransferPublicKeySet')
    this.checkData(tokenId, data => {
      data.publicKey = publicKeyHex
      if (!this.checkExistStatus(TransferStatus.PublicKeySet)) {
        data.statuses?.unshift({
          status: TransferStatus.PublicKeySet,
          timestamp: Date.now(),
        })
      }
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
      this.onTransferPublicKeySetCall?.()
    })
  }

  onTransferPasswordSet(tokenId: bigint, encryptedPasswordHex: string, blockNumber: bigint) {
    console.log('onTransferPasswordSet')
    this.checkData(tokenId, data => {
      data.encryptedPassword = encryptedPasswordHex
      if (this.checkExistStatus(TransferStatus.PasswordSet)) return
      data.statuses?.unshift({
        status: TransferStatus.PasswordSet,
        timestamp: Date.now(),
      })
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
    })
  }

  onTransferFinished(tokenId: bigint) {
    console.log('onTransferFinished')
    if (!this.data) return
    this.checkActivation(tokenId, () => {
      this.data = undefined
      this.setIsWaitingForEvent(false)
      this.tokenStore.reload()
      this.onTransferFinishedCall?.()
    })
  }

  onTransferFraudReported(tokenId: bigint, blockNumber: bigint) {
    console.log('onTransferFraud')
    if (this.checkExistStatus(TransferStatus.FraudReported)) return
    this.checkData(tokenId, data => {
      data.statuses?.unshift({
        status: TransferStatus.FraudReported,
        timestamp: Date.now(),
      })
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
    })
  }

  onTransferFraudDecided(tokenId: bigint, approved: boolean, blockNumber: bigint) {
    if (this.checkExistStatus(TransferStatus.Finished)) return
    this.checkData(tokenId, data => {
      data.fraudApproved = approved
      data.statuses?.unshift({
        status: TransferStatus.Finished,
        timestamp: Date.now(),
      })
      this.setIsWaitingForEvent(false)
      this.setBlockTransfer(blockNumber)
    })
  }

  onTransferCancellation(tokenId: bigint, blockNumber: bigint) {
    console.log('onTransferCancel')
    this.checkActivation(tokenId, () => {
      this.data = undefined
      this.setIsWaitingForEvent(false)
      this.onTransferCancelCall?.()
    })
  }

  get isWaitingForContinue() {
    return this.isWaitingForEvent || this.isWaitingForReciept || this.isWaitingForSocket
  }
}
