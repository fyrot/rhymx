import { Album, Song } from "../main/bgutils/songInformation";
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
    queueUpdateQueueAndIndex: (newQueue: Song[], newIndex: number) => void,
    queueRetrieveCurrent: () => Promise<Song>,
    queueNotifyAudioBar: (callback) => void, 
    queueNotifyTrackEnded: () => void,
    queueNotifySkipTracks: (tracksSkipped:number) => void,
    pluginsAddSources: () => void
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints