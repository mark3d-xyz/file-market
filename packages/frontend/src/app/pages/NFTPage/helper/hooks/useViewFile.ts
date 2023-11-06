import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { type HiddenFileMetaData } from '../../../../../swagger/Api'
import { type typeFiles } from '../../../../components/MarketCard/helper/data'
import { fileToExtension, fileToType } from '../../../../components/MarketCard/helper/fileToType'
import { useStores } from '../../../../hooks'
import { useSeed } from '../../../../processing/SeedProvider/useSeed'
import { type DecryptResult } from '../../../../processing/types'
import { PreviewState } from '../../components/PreviewNFTFlow'

interface IUseViewFileProps {
  hiddenFile?: HiddenFileMetaData
  canViewFile?: boolean
  getFile?: () => Promise<DecryptResult<File>>
}

export const useViewFile = ({ hiddenFile, canViewFile, getFile }: IUseViewFileProps) => {
  const [is3D, setIs3D] = useState<boolean | undefined>(undefined)

  const [previewState, setPreviewState] = useState<{
    state: PreviewState
    data?: string
  }>()
  const { address, isConnected } = useAccount()
  const { tokenMetaStore, tokenStore } = useStores()
  const seed = useSeed(address)
  const [isViewFile, setIsViewFile] = useState<boolean>(false)

  const extensionFile: string | undefined = useMemo(() => {
    return hiddenFile ? fileToExtension(hiddenFile) : undefined
  }, [hiddenFile])

  const typeFile: typeFiles | undefined = useMemo(() => {
    return hiddenFile ? fileToType(hiddenFile) : undefined
  }, [hiddenFile])

  const isLoading: boolean = useMemo(() => {
    return (tokenMetaStore.isLoading || tokenStore.isLoading || (!seed && isConnected))
  }, [tokenMetaStore.isLoading, tokenStore.isLoading, !seed, isConnected])

  const isCanView: boolean = useMemo(() => {
    if (!getFile) return false
    const availableExtensions3D: string[] = ['glb', 'gltf']
    const availableExtensionsImage: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    if (availableExtensions3D.includes(String(extensionFile))) {
      setIs3D(true)

      return canViewFile
    } else if (availableExtensionsImage.includes(String(extensionFile))) {
      setIs3D(false)

      return canViewFile
    }

    return false
  }, [hiddenFile, getFile, canViewFile])

  const handleLoadClick = async () => {
    if (!getFile) return

    setPreviewState({
      state: PreviewState.LOADING,
    })

    let model: DecryptResult<File>
    try {
      model = await getFile()
    } catch (error) {
      setPreviewState({
        state: PreviewState.LOADING_ERROR,
        data: `${error}`,
      })

      return
    }

    if (!model.ok) {
      setPreviewState({
        state: PreviewState.LOADING_ERROR,
        data: `Unable to decrypt. ${model.error}`,
      })

      return
    }

    const fr = new FileReader()

    fr.onload = (e) => {
      setPreviewState({
        state: PreviewState.LOADED,
        data: String(e.target?.result ?? ''),
      })
    }

    fr.onerror = () => {
      setPreviewState({
        state: PreviewState.LOADING_ERROR,
        data: 'Unable to download, try again later',
      })
    }

    if (isCanView) {
      fr.readAsDataURL(model.result)
    } else {
      setPreviewState({
        state: PreviewState.EXTENSION_ERROR,
        data: 'Preview is not available',
      })
    }
  }

  useEffect(() => {
    if (!isConnected) {
      setIsViewFile(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (isLoading) {
      setPreviewState({
        state: PreviewState.LOADING,
      })
    }
  }, [isLoading])

  const onViewFileButtonClick = () => {
    const isViewFileNew = !isViewFile
    if (isViewFileNew) {
      void handleLoadClick()
    }
    setIsViewFile(isViewFileNew)
  }

  return {
    isCanViewFile: isCanView,
    onViewFileButtonClick,
    previewState,
    is3D,
    typeFile,
    isLoadingFile: isLoading,
    isViewFile,
  }
}
