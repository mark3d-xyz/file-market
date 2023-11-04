import ArchivesImg from './img/Archives.png'
import DocsImg from './img/Docs.png'
import GlbImg from './img/GlobModels.png'
import GraphicImg from './img/Graphic.png'
import MusicImg from './img/Music.png'
import PhotosImg from './img/Photos.png'
import PromocodesImg from './img/Promocodes.png'
import SoundsImg from './img/Sounds.png'
import VideosImg from './img/Videos.png'

export type typeFiles = 'document' | 'music' | 'rar' | 'picture' | '3D' | 'video' | 'code' | 'another'

export const typeOptions: Record<typeFiles, string[]> = {
  '3D': ['.obj', '.3ds', '.fbx', '.dae', '.blend', '.stl', '.ply', '.max', '.glb', '.gltf'],
  another: [],
  code: ['.c', '.cpp', '.h', '.hpp', '.java', '.py', '.rb', '.html', '.css', '.js', '.php', '.sql', '.xml'],
  document: ['.doc', '.docx', '.pdf', '.txt', '.rtf', '.odt', '.wpd', '.tex', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.ods'],
  music: ['.mp3', '.wav', '.aac', '.wma', '.flac', '.m4a', '.ogg', '.ape', '.alac'],
  picture: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.psd', '.ai', '.eps'],
  rar: ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.xz'],
  video: ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.mpeg', '.mpg', '.3gp', '.webm'],
}

export const CategoriesImg: Record<string, string> = {
  '3D models': GlbImg,
  another: DocsImg,
  Graphics: GraphicImg,
  Photos: PhotosImg,
  Videos: VideosImg,
  Music: MusicImg,
  Sounds: SoundsImg,
  Docs: DocsImg,
  Promocodes: PromocodesImg,
  Archives: ArchivesImg,
}
