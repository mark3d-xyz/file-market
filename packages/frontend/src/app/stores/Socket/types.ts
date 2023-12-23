export interface ObjectParamsConnectEft {
  id?: string
  address?: `0x${string}`
}

export enum ConnectionType {
  Eft,
}

export interface ISocketConnect {
  socket?: WebSocket
  type?: ConnectionType
  chainId?: number
  lastMessage?: string
}

export interface sendQueueType {
  message: string
  onMessage: (event: MessageEvent) => void
  onConnect?: () => void
}
