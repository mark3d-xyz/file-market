import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { SuccessNavBody, SuccessOkBody } from '../../components/Modal/Modal'
import { isMainnet, mark3dConfig } from '../../config/mark3d'
import { useStatusState } from '../../hooks'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { useCheckWhiteListStore } from '../../hooks/useCheckWhiteListStore'
import { useComputedMemo } from '../../hooks/useComputedMemo'
import { useMultiChainStore } from '../../hooks/useMultiChainStore'
import { useStatusModal } from '../../hooks/useStatusModal'
import { wrapRequest } from '../../utils/error/wrapRequest'
import { useFulfillOrder } from '../nft-interaction'

const filecoinMainnetId = 314
const filecointTestnetId = 314159

interface ISequencerReq {
  suffix?: string
  collectionAddress?: string
}
interface IGetSignWhiteList {
  address?: `0x${string}`
  whiteList?: string
}
export const useFileBunniesMint = () => {
  const { address, isConnected } = useAccount()
  const whiteListStore = useCheckWhiteListStore(address)
  const api = useApi()
  const [isFreeMintSoldOut, setIsFreeMintSoldOut] = useState<boolean>(false)
  const [isPayedMintSoldOut, setIsPayedMintSoldOut] = useState<boolean>(false)

  const multiChainStore = useMultiChainStore()

  const { connect } = useAuth()
  const [isLoadingReq, setIsLoadingReq] = useState<boolean>(false)
  const { fulfillOrder, ...statuses } = useFulfillOrder()

  const { wrapPromise, statuses: statusesReq } = useStatusState()

  const { modalProps, setModalBody, setModalOpen } = useStatusModal({
    statuses: {
      ...statuses,
      result: '',
      error: statuses.error ?? statusesReq.error,
    },
    okMsg: 'Order is fulfilled! Now you need to wait 4 minutes until it appears in your profile and you can continue the actions',
    loadingMsg: 'Fulfilling order',
  })

  const collectionAddressReq = async () => {
    const response = await wrapRequest(async () => api.collections.fullFileBunniesList({ limit: 1 }))

    return response.collection?.address
  }
  const sequencerReq = async ({ suffix, collectionAddress }: ISequencerReq) => {
    if (!(collectionAddress && suffix && address)) return
    const tokenResp = await wrapRequest(
      async () => api.sequencer.acquireDetail(collectionAddress,
        { wallet: address, suffix }))

    if (tokenResp.isSetEmpty) return

    return tokenResp.tokenId
  }

  const chainName = useMemo(() => {
    return isMainnet
      ? multiChainStore.getChainById(filecoinMainnetId)?.chain?.name
      : multiChainStore.getChainById(filecointTestnetId)?.chain?.name
  }, [isMainnet, multiChainStore])

  const getSignWhiteList = async({ whiteList, address }: IGetSignWhiteList) => {
    if (!(whiteList && address)) return
    const sign = await wrapRequest(async () => api.collections.fileBunniesWhitelistSignDetail(whiteList, address))

    return sign?.signature
  }
  const payedMint = wrapPromise(async () => {
    if (!isConnected) {
      connect()

      return
    }
    setIsLoadingReq(true)
    const collectionAddress = await collectionAddressReq() as `0x${string}`
    const tokenId = await sequencerReq({ suffix: 'payed', collectionAddress })
    if (!tokenId) {
      setIsPayedMintSoldOut(true)
      setIsLoadingReq(false)
      setModalOpen(true)
      setModalBody(<SuccessOkBody
        description={'Someone was a little faster than you and took the last FileBunny'}
        isSuccessImg={false}
        handleClose={() => {
          setModalOpen(false)
        }}
        buttonText={'Okay, then'}
      />)

      return
    }
    await fulfillOrder({
      collectionAddress,
      tokenId,
      price: mark3dConfig.fileBunniesPrice.toString(),
    })
    setIsLoadingReq(false)
    setModalBody(<SuccessNavBody
      buttonText='Show my FileBunny'
      link={`/collection/${chainName}/${collectionAddress}/${tokenId}`}
      onPress={() => {
        setModalOpen(false)
      }}
      underText={'Your EFT has been generated, but the purchase\n' +
        '        transaction is not yet complete. On your FileBunny page,\n' +
        '        you need to wait until the hidden file with gifts is\n' +
        '        transferred and becomes available for download. After\n' +
        '        this, you need to confirm the completion of the deal by clicking the "Send payment" or "Finalize the deal" button.'}
    />)
  })

  const freeMint = wrapPromise(async () => {
    if (!isConnected) {
      connect()

      return
    }
    setIsLoadingReq(true)
    const collectionAddress = await collectionAddressReq() as `0x${string}`
    const tokenId = await sequencerReq({ suffix: whiteListStore.data?.whitelist, collectionAddress })
    if (!tokenId) {
      setIsFreeMintSoldOut(true)
      setIsLoadingReq(false)
      setModalOpen(true)
      setModalBody(<SuccessOkBody
        description={'Someone was a little faster than you and took the last Free Mint FileBunny'}
        isSuccessImg={false}
        handleClose={() => {
          setModalOpen(false)
        }}
        buttonText={'Okay, then'}
      />)
    } else {
      const sign = await getSignWhiteList({ whiteList: whiteListStore.data?.whitelist, address })
      await fulfillOrder({
        collectionAddress,
        tokenId,
        price: '1',
        signature: sign,
      })
      setIsLoadingReq(false)
      setModalBody(<SuccessNavBody
        buttonText='Show my FileBunny'
        link={`/collection/${chainName}/${collectionAddress}/${tokenId}`}
        onPress={() => {
          setModalOpen(false)
        }}
        underText={'Your EFT has been generated, but the purchase\n' +
          '        transaction is not yet complete. On your FileBunny page,\n' +
          '        you need to wait until the hidden file with gifts is\n' +
          '        transferred and becomes available for download. After\n' +
          '        this, you need to confirm the completion of the deal by clicking the "Send payment" or "Finalize the deal" button.'}
      />)
    }
  })

  const { isLoading: isLoadingFulFill } = statuses
  const isLoading = useComputedMemo(() => {
    return (isLoadingFulFill || whiteListStore.isLoading || isLoadingReq) && (!statuses.error && !statusesReq.error)
  }, [whiteListStore.isLoading, isLoadingReq, isLoadingFulFill, statuses.error, statusesReq.error])

  return {
    isFreeMintSoldOut: ((+(whiteListStore.data?.ordersLeft?.free ?? 0) <= 0) || isFreeMintSoldOut) && isConnected,
    isPayedMintSoldOut: ((+(whiteListStore.data?.ordersLeft?.payed ?? 0) <= 0) || isPayedMintSoldOut) && isConnected,
    isLoading,
    modalProps,
    payedMint,
    freeMint,
    whiteList: whiteListStore.data?.whitelist,
  }
}
