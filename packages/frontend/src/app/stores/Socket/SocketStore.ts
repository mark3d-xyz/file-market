import { makeAutoObservable } from 'mobx'

import { type EFTSubscriptionMessage, type EFTSubscriptionRequest } from '../../../swagger/Api'
import { type MultiChainStore } from '../MultiChain/MultiChainStore'
import { type OrderStore } from '../Order/OrderStore'
import { type RootStore } from '../RootStore'
import { type TokenStore } from '../Token/TokenStore'
import { type TransferStore } from '../Transfer/TransferStore'
import { url } from './data'
import { ConnectionType, type ISocketConnect } from './types'

interface ISubscribe<T, M> {
  params: T
  url: string
  type: ConnectionType
  onSubscribeMessage: (event: MessageEvent<M>, chainId?: number) => void
  chainId?: number
  onClose: () => void
}

interface IFindSocket {
  chainId?: number
  type: ConnectionType
}

export class SocketStore {
  socketConnects: ISocketConnect[]
  multiChainStore: MultiChainStore

  transferStore: TransferStore
  orderStore: OrderStore
  tokenStore: TokenStore

  constructor(rootStore: RootStore) {
    this.socketConnects = []
    makeAutoObservable(this)
    this.transferStore = rootStore.transferStore
    this.orderStore = rootStore.orderStore
    this.multiChainStore = rootStore.multiChainStore
    this.tokenStore = rootStore.tokenStore
  }

  private readonly createISocketConnect = ({ socket, type, chainId, lastMessage }: ISocketConnect): ISocketConnect => {
    return ({
      socket,
      type,
      chainId,
      lastMessage,
    })
  }

  private readonly subscribe = <T, M>(props: ISubscribe<T, M>) => {
    const { params, type, url, onSubscribeMessage, chainId, onClose } = props
    let socket: WebSocket
    const socketConnect = this.socketConnects[this.findIndexSocket({ type, chainId })]
    console.log(this.socketConnects)
    console.log(props)
    console.log(socketConnect)
    if (socketConnect) {
      console.log('Old socket')
      socketConnect.socket?.send(JSON.stringify(params))
      socketConnect.lastMessage = JSON.stringify(params)
      const socket = this.socketConnects[this.findIndexSocket({ type, chainId })]?.socket
      if (socket) {
        socket.onclose = onClose
      }
    } else {
      console.log('New socket')
      socket = this.createConnection(url)
      socket.onopen = function(this) {
        this.send(JSON.stringify(params))
      }
      socket.onmessage = function(event: MessageEvent<M>) {
        onSubscribeMessage(event, chainId)
      }
      socket.onclose = onClose
      const lastMessage = JSON.stringify(params)
      this.socketConnects = [...this.socketConnects, (this.createISocketConnect({ socket, type, chainId, lastMessage }))]
    }
  }

  private readonly findIndexSocket = ({ type, chainId }: IFindSocket) => {
    return this.socketConnects.findIndex(item => {
      if (chainId !== undefined) {
        return item.type === type && item.chainId === chainId && item.socket?.readyState === WebSocket.OPEN
      }

      return item.type === type && item.socket?.readyState === WebSocket.OPEN
    })
  }

  private readonly onMessageSubscribeToEft = (event: MessageEvent<string>) => {
    const data = JSON.parse(event.data) as EFTSubscriptionMessage
    if (!data || Object.keys(data).length === 0) {
      // sometimes backend sends empty subscription
      return
    }
    const transfer = data.transfer
    const order = data.order
    const token = data.token
    this.transferStore.setData(transfer)
    this.orderStore.setData(order)
    this.tokenStore.setData(token)
    this.transferStore.setIsWaitingSocket(false)

    console.log(transfer)
    console.log(order)
    console.log(token)

    // Если токен есть, то можно редиректить
    if (!this.transferStore.isCanRedirectMint && token) this.transferStore.setIsCanRedirectMint(true)
  }

  disconnect({ type, chainId }: IFindSocket) {
    const socketConnect = this.socketConnects[this.findIndexSocket({ type, chainId })]
    console.log('Disconnect')
    if (socketConnect?.socket) {
      socketConnect.socket.onclose = () => {}
      socketConnect.socket?.close()
    }
  }

  subscribeToEft(params: EFTSubscriptionRequest, chainId?: number) {
    const wsUrl = this.multiChainStore.getChainById(chainId)?.wsUrl
    this.socketConnects.forEach(item => {
      if (item.chainId !== chainId && item.type === ConnectionType.Eft) this.disconnect({ type: item.type, chainId })
    })
    this.subscribe<EFTSubscriptionRequest, string>({
      params,
      url: `${wsUrl}${url[ConnectionType.Eft]}/${params.collectionAddress}/${params.tokenId}`,
      type: ConnectionType.Eft,
      onSubscribeMessage: this.onMessageSubscribeToEft,
      onClose: () => {
        setTimeout(() => { this.subscribeToEft(params, chainId) }, 2000)
      },
      chainId,
    })
  }

  createConnection(url: string) {
    const socket = new WebSocket(url)

    return socket
  }
}
