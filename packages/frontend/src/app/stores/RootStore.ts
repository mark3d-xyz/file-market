import { AuthStore } from './auth/AuthStore'
import { BlockStore } from './BlockStore/BlockStore'
import { ChainStore } from './ChainStore/ChainStore'
import { CollectionStore } from './Collection/CollectionStore'
import { CollectionAndTokenListStore } from './CollectionAndTokenList/CollectionAndTokenListStore'
import { CollectionListStore } from './CollectionsList/CollectionListStore'
import { CollectionTokenListStore } from './CollectionTokenList/CollectionTokenListStore'
import { ConversionRateStore } from './Currency/ConversionRateStore'
import { CurrentBlockChainStore } from './CurrentBlockChain/CurrentBlockChainStore'
import { DateStore } from './Date/DateStore'
import { DialogStore } from './Dialog/DialogStore'
import { ErrorStore } from './Error/ErrorStore'
import { MultiChainStore } from './MultiChain/MultiChainStore'
import { OrderStore } from './Order/OrderStore'
import { OpenOrderListStore } from './OrderList/OrderListStore'
import { ProfileStore } from './Profile/ProfileStore'
import { PublicCollectionStore } from './PublicCollectionStore/PublicCollectionStore'
import { SocketStore } from './Socket/SocketStore'
import { TokenMetaStore } from './Token/TokenMetaStore'
import { TokenStore } from './Token/TokenStore'
import { TransferListStore } from './Transfer/TransferListStore'
import { TransferStore } from './Transfer/TransferStore'
import { TransfersHistoryStore } from './TransfersHistory/TransfersHistoryStore'
import { UserStore } from './User/UserStore'
import { UserTransferStore } from './UserTransfers/UserTransfersStore'
import { WhiteListStore } from './WhiteList/WhiteListStore'

export class RootStore {
  authStore: AuthStore
  dialogStore: DialogStore
  dateStore: DateStore
  blockStore: BlockStore
  errorStore: ErrorStore
  collectionAndTokenList: CollectionAndTokenListStore
  transferListStore: TransferListStore
  transferStore: TransferStore
  collectionTokenList: CollectionTokenListStore
  orderStore: OrderStore
  tokenStore: TokenStore
  tokenMetaStore: TokenMetaStore
  profileStore: ProfileStore
  orderListStore: OpenOrderListStore
  collectionStore: CollectionStore
  transfersHistoryStore: TransfersHistoryStore
  userTransferStore: UserTransferStore
  publicCollectionStore: PublicCollectionStore
  conversionRateStore: ConversionRateStore
  whitelistStore: WhiteListStore
  collectionsListStore: CollectionListStore
  multiChainStore: MultiChainStore
  chainStore: ChainStore
  currentBlockChainStore: CurrentBlockChainStore
  socketStore: SocketStore
  userStore: UserStore

  constructor() {
    this.dialogStore = new DialogStore()
    this.blockStore = new BlockStore()
    this.dateStore = new DateStore()
    this.errorStore = new ErrorStore(this)
    this.profileStore = new ProfileStore(this)
    this.userStore = new UserStore(this)
    this.authStore = new AuthStore(this)
    this.multiChainStore = new MultiChainStore(this)
    this.chainStore = new ChainStore(this)
    this.currentBlockChainStore = new CurrentBlockChainStore(this)
    this.collectionAndTokenList = new CollectionAndTokenListStore(this)
    this.transferListStore = new TransferListStore(this)
    this.collectionTokenList = new CollectionTokenListStore(this)
    this.orderStore = new OrderStore(this)
    this.tokenStore = new TokenStore(this)
    this.transferStore = new TransferStore(this)
    this.tokenMetaStore = new TokenMetaStore(this)
    this.orderListStore = new OpenOrderListStore(this)
    this.collectionStore = new CollectionStore(this)
    this.transfersHistoryStore = new TransfersHistoryStore(this)
    this.userTransferStore = new UserTransferStore(this)
    this.publicCollectionStore = new PublicCollectionStore(this)
    this.conversionRateStore = new ConversionRateStore(this)
    this.whitelistStore = new WhiteListStore(this)
    this.collectionsListStore = new CollectionListStore(this)
    this.socketStore = new SocketStore(this)
  }
}

export const rootStore = new RootStore()
