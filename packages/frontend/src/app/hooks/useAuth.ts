import { useCallback } from 'react'
import { useAccount } from 'wagmi'

import { ConnectFileWalletDialog } from '../components/Web3/ConnectFileWalletDialog'
import useAppAuthAndConnect, { type IUseAppAuthAndConnect } from './useAppAuthAndConnect'
import { useStores } from './useStores'

type IUseAuth = IUseAppAuthAndConnect

export const useAuth = (props?: IUseAuth) => {
  const { dialogStore } = useStores()
  const { isConnected } = useAccount()
  const { connect: openWeb3Modal, isLoading } = useAppAuthAndConnect(props)

  const openDialog = () => {
    dialogStore.openDialog({
      component: ConnectFileWalletDialog,
      props: {
        name: 'ConnectMain',
        openWeb3Modal,
      },
    })
  }

  const connect = useCallback(() => {
    if (props?.isWithSign && isConnected) {
      openWeb3Modal()
    } else {
      openDialog()
    }
  }, [isConnected, props?.isWithSign, openDialog, openWeb3Modal])

  return {
    connect,
    isLoading,
  }
}
