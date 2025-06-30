export interface Song {
  name: string,
  artists: string[],  
  filePath: string,
  trackNo: number,
  songId: string,
  albumRefId: string
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

