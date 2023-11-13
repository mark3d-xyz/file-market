import { type typeFiles } from '../../../../components/MarketCard/helper/data'
import ThirdDView from '../../img/3DView.svg'
import ImgView from '../../img/ImageView.png'

export const ViewFilesImage: Record<typeFiles, string> = {
  '3D': ThirdDView,
  another: ImgView,
  code: ImgView,
  document: ImgView,
  music: ImgView,
  picture: ImgView,
  rar: ImgView,
  video: ImgView,
}

export const ViewFilesText: Record<typeFiles, string> = {
  '3D': '3D view',
  another: 'View file',
  code: 'View file',
  document: 'View file',
  music: 'View file',
  picture: 'View file',
  rar: 'View file',
  video: 'View file',
}
