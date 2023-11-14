import { Warning } from '@mui/icons-material'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { styled } from '../../../../styles'
import { Api } from '../../../../swagger/Api'
import { chains } from '../../../config/web3Modal'
import { useStores } from '../../../hooks'
import { Button, Popover, PopoverContent, PopoverTrigger } from '../../../UIkit'
import { getHttpLinkFromIpfsString } from '../../../utils/nfts'
import { AddressIcon, DisconnectButton, SwitchNetworkButton } from '../../Web3'
import { ViewMnemonicButton } from '../../Web3/ViewMnemonicButton/ViewMnemonicButton'
import { AccountButton } from './AccountButton'

const Spacer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  gap: '$3',
})

const IconWrapper = styled('div', {
  background: '$white',
  dflex: 'center',
  width: '100%',
  height: '100%',
})

export const AppAccountMenu: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const close = useCallback(() => { setIsOpen(false) }, [setIsOpen])
  const { chain } = useNetwork()
  const needToSwitchNetwork = chain && !(chains.find(item => item.id === chain.id))
  const { userStore } = useStores()
  const [username, setUserName] = useState<string>()
  const [avatar, setAvatar] = useState<string>()
  const profileService = new Api({ baseUrl: '/api' }).profile
  useEffect(() => {
    if (address) {
      profileService.profileDetail(address).then((res) => {
        setUserName(res.data.username)
        setAvatar(res.data.avatarUrl)
      })
    }
  }, [address])

  const redirectAddress = useMemo(() => {
    return (userStore.user?.username ?? username) ?? address
  }, [address, userStore.user, username])

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          icon
          secondary
          small
          iconCover
          blueBorder
        >
          <IconWrapper>
            {needToSwitchNetwork ? (
              <Warning
                sx={{
                  color: 'var(--colors-red)',
                }}
              />
            ) : (avatar ? <img style={{ width: '100%', height: '100%' }} src={getHttpLinkFromIpfsString(avatar)} /> : (
              <AddressIcon
                address={address ?? ''}
                size={36}
              />
            )
            )}
          </IconWrapper>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Spacer>
          {needToSwitchNetwork && (
            <SwitchNetworkButton onPress={close} />
          )}
          <AccountButton address={redirectAddress ?? ''} onPress={close} />
          <ViewMnemonicButton />
          <DisconnectButton onPress={close} />
        </Spacer>
      </PopoverContent>
    </Popover>
  )
}
