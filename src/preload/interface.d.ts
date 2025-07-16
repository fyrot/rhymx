import { LRCData } from "../main/bgutils/LRCParserUtils";
import { Album, Song, AudioBarSong, Artist } from "../main/bgutils/songInformation";
export interface IElectronAPI {
    closeWindow: (shouldClose: boolean) => void,
    toggleMaximizeWindow: () => void,
    windowMaximized: (callback:any) => void,
    windowUnmaximized: (callback: any) => void,
    minimizeWindow: () => void,
    libraryPrefAddNewSource: () => Promise<string[]>,
    libraryPrefRetrieveSourceList: () => Promise<string[]>
    libraryPrefUpdateSourceList: (sources:string[]) => void,
    libraryPrefSourceIndex: () => void,
    libraryRetrieveAllAlbums: () => Promise<Album[]>,
    libraryRetrieveAlbumById: (id: string) => Promise<Album | undefined>,
    libraryRetrieveAlbumImageById: (id: string) => Promise<string>,
    libraryRetrieveAlbumNameById: (id:string) => Promise<string>,
    libraryRetrieveArtistById: (id:string) => Promise<Artist | undefined>
    queueUpdateQueueAndIndex: (newQueue: AudioBarSong[] | null, newIndex: number) => void,
    queueUpdateAddToQueue: (newSong: AudioBarSong) => void,
    queueRetrieveCurrent: () => Promise<[AudioBarSong, number]>,
    queueRetrieveCurrentLRC: (filePath:string) => Promise<LRCData>,
    queueNotifyAudioBar: (callback) => void, 
    queueNotifyAudioBarQueue: (callback) => void,
    queueNotifyTrackEnded: () => void,
    queueNotifySkipTracks: (tracksSkipped:number) => void,
    currentlyPlayingUpdateVisibility: (visibility:boolean) => void,
    currentlyPlayingReceiveVisibility: (callback) => void,
    pluginsAddSources: () => void
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints