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
  onSubscribeMessage: (event: MessageEvent<M>, chainName?: string) => void
  chainName?: string
  onClose: () => void
}

interface IFindSocket {
  chainName?: string
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

  private readonly createISocketConnect = ({ socket, type, chainName, lastMessage }: ISocketConnect): ISocketConnect => {
    return ({
      socket,
      type,
      chainName,
      lastMessage,
    })
  }

  private readonly subscribe = <T, M>(props: ISubscribe<T, M>) => {
    const { params, type, url, onSubscribeMessage, chainName, onClose } = props
    let socket: WebSocket
    const socketConnect = this.socketConnects[this.findIndexSocket({ type, chainName })]
    console.log(this.socketConnects)
    console.log(props)
    console.log(socketConnect)
    if (socketConnect) {
      console.log('Old socket')
      socketConnect.socket?.send(JSON.stringify(params))
      socketConnect.lastMessage = JSON.stringify(params)
      const socket = this.socketConnects[this.findIndexSocket({ type, chainName })]?.socket
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
        onSubscribeMessage(event, chainName)
      }
      socket.onclose = onClose
      const lastMessage = JSON.stringify(params)
      this.socketConnects = [...this.socketConnects, (this.createISocketConnect({ socket, type, chainName, lastMessage }))]
    }
  }

  private readonly findIndexSocket = ({ type, chainName }: IFindSocket) => {
    return this.socketConnects.findIndex(item => {
      if (chainName) {
        return item.type === type && item.chainName === chainName && item.socket?.readyState === WebSocket.OPEN
      }

      return item.type === type && item.socket?.readyState === WebSocket.OPEN
    })
  }

  private readonly onMessageSubscribeToEft = (event: MessageEvent<string>, chainName?: string) => {
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

    console.log(transfer)
    console.log(order)
    console.log(token)
    if (data.event === 'Transfer') this.transferStore.setIsCanRedirectMint(true)
  }

  disconnect({ type, chainName }: IFindSocket) {
    const socketConnect = this.socketConnects[this.findIndexSocket({ type, chainName })]
    console.log('Disconnect')
    if (socketConnect?.socket) {
      socketConnect.socket.onclose = () => {}
      socketConnect.socket?.close()
    }
  }

  subscribeToEft(params: EFTSubscriptionRequest, chainName?: string) {
    const wsUrl = this.multiChainStore.getChainByName(chainName)?.wsUrl
    this.socketConnects.forEach(item => {
      if (item.chainName !== chainName && item.type === ConnectionType.Eft) this.disconnect({ type: item.type, chainName: item.chainName })
    })
    this.subscribe<EFTSubscriptionRequest, string>({
      params,
      url: `${wsUrl}${url[ConnectionType.Eft]}/${params.collectionAddress}/${params.tokenId}`,
      type: ConnectionType.Eft,
      onSubscribeMessage: this.onMessageSubscribeToEft,
      onClose: () => {
        setTimeout(() => { this.subscribeToEft(params, chainName) }, 2000)
      },
      chainName,
    })
  }

  createConnection(url: string) {
    const socket = new WebSocket(url)

    return socket
  }

  // unsubscribeEft() {
  //   this.disconnect(ConnectionType.Eft)
  // }
  //
  // get isConnectedEft() {
  //   const socketConnect = this.socketConnects[this.findIndexSocket({ type: ConnectionType.Eft })]
  //
  //   return socketConnect?.socket?.readyState === WebSocket.OPEN
  // }
}
