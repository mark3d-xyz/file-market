import 'swiper/css'
import 'swiper/css/navigation'
import '@google/model-viewer'

import { Loading } from '@nextui-org/react'
import screenfull from 'screenfull'
import { Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide as SwiperSlideUnstyled } from 'swiper/react'

import { styled } from '../../../../styles'
import { gradientPlaceholderImg, textVariant } from '../../../UIkit'
import css from './styles.module.css'

const CenterContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: '$3',
  flexDirection: 'column',
  position: 'relative',
})

const ErrorMessage = styled('p', {
  ...textVariant('primary1'),
  fontWeight: 600,
  color: '$black',
})

const SwiperSlide = styled(SwiperSlideUnstyled, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const getFileExtension = (file: File) =>
  file.name.split('.')?.pop() ?? ''

export enum PreviewState {
  LOADED,
  LOADING,
  LOADING_ERROR,
  EXTENSION_ERROR,
}

interface PreviewNFTFlowProps {
  imageURL: string
  isCanView?: boolean
  is3D?: boolean
  previewState: {
    state: PreviewState
    data?: string
  }
  isLoading?: boolean
  isViewFile?: boolean
}

const SwiperStyled = styled(Swiper)

const ImageStyle = styled('img', {
  width: 'max-content',
  maxWidth: '1100px',
  height: 'max-content',
  maxHeight: '500px',
  borderRadius: '20px',
  '@lg': {
    maxWidth: '812px',
  },
  '@md': {
    maxWidth: '540px',
  },
  '@sm': {
    maxWidth: 358,
    maxHeight: 358,
    marginBottom: '40px',
  },
})

/** Component that implement logic for loading and showing 3D models  */
export const PreviewNFTFlow = ({
  imageURL,
  isCanView,
  is3D,
  isViewFile,
  isLoading,
  previewState,
}: PreviewNFTFlowProps) => {
  return (
    <CenterContainer>
      <SwiperStyled
        navigation
        modules={[Navigation, Pagination]}
        className={css.__swiper}
        allowTouchMove={false}
        pagination={{ clickable: true }}
        css={{
          '--swiper-navigation-color': 'var(--colors-gray300)',
          '--swiper-navigation-size': '20px',
        }}
      >
        <SwiperSlide>
          {(isViewFile && isCanView) ? (
            <>
              {previewState?.state === PreviewState.LOADED ? (
                is3D ? (
                  <model-viewer
                    camera-controls
                    src={previewState.data}
                    shadow-intensity='1'
                    touch-action='pan-y'
                    style={{ width: '100%', height: '85%' }}
                  />
                )
                  : (
                    <ImageStyle
                      src={previewState.data}
                      style={{ objectFit: 'contain' }}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null
                        currentTarget.src = gradientPlaceholderImg
                      }}
                    />
                  )
              ) : previewState?.state === PreviewState.LOADING ? (
                <Loading size='xl' color={'white'} />
              ) : previewState?.state === PreviewState.LOADING_ERROR ? (
                <ErrorMessage>{previewState?.data}</ErrorMessage>
              ) : previewState?.state === PreviewState.EXTENSION_ERROR && (
                <ErrorMessage>{previewState?.data}</ErrorMessage>
              )}
            </>
          )
            : (
              <>
                {isLoading ? <Loading size='xl' color={'white'} /> : (
                  <ImageStyle
                    src={imageURL}
                    style={{ cursor: 'pointer', objectFit: 'contain' }}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null
                      currentTarget.src = gradientPlaceholderImg
                    }}
                    onClick={(e) => {
                      if (screenfull.isFullscreen) {
                        screenfull.exit()
                      } else if (screenfull.isEnabled) {
                        screenfull.request(e.target as Element)
                      }
                    }}
                  />
                )}
              </>
            )}
        </SwiperSlide>
      </SwiperStyled>
    </CenterContainer>
  )
}
