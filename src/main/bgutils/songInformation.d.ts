export interface Song {
  name: string,
  artists: string[],  
  filePath: string,
  path: string,
  trackNo: number,
  songId: string,
  albumRefId: string,
  duration: number,
  hasLRC: boolean
}
export interface Discs {
  [key: string]: Song[];
}
export interface Album {
  name: string,
  hasImage: boolean,
  artists: string[],
  discs: Discs,
  albumId: string
}
export interface Playlist {
  name: string, 
  songs: Song[],
  albumImage: {
    hasData: boolean,
    dataUrl: string
  }
  playlistId: string
}
export interface Artist {
  artistId: string,
  name: string,
  discography: string[] // album ids
}
export interface AudioBarSong {
  song: Song,
  albumImage: {
    hasData: boolean,
    dataUrl: string
  }
  albumName: string,
  identifier: string
}
export interface NativeResImage {
  hasData: boolean,
  dataUrl: string
}
export interface LowResImage {
  hasData: boolean,
  dataUrl: string
}
export interface ResImageCollection {
  imageFound: boolean,
  native: NativeResImage,
  lowRes: LowResImage
}

