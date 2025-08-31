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
export interface Album {
  name: string,
  artists: string[],
  discs: Map<string, Song[]>,
  albumImage: {
    hasData: boolean,
    dataUrl: string
  },
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