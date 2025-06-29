export interface Song {
  name: string,
  artists: string[],  
  filePath: string,
  songId: string,
  albumRefId: string
}
export interface Album {
  name: string,
  artists: string[],
  discs: Map<string, Song[]>,
  albumImage: string,
  albumId: string
}
