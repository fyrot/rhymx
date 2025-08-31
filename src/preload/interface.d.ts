import { LRCData } from "../main/bgutils/LRCParserUtils";
import { Album, Song, AudioBarSong, Artist, Playlist } from "../main/bgutils/songInformation";
import { PluginSchema } from "../main/bgutils/pluginInformation";
export interface IElectronAPI {
    closeWindow: (shouldClose: boolean) => void,
    toggleMaximizeWindow: () => void,
    windowMaximized: (callback:any) => void,
    windowUnmaximized: (callback: any) => void,
    minimizeWindow: () => void,
    retrieveOS: () => Promise<string>,
    libraryPrefAddNewSource: () => Promise<string[]>,
    libraryPrefRetrieveSourceList: () => Promise<string[]>
    libraryPrefUpdateSourceList: (sources:string[]) => void,
    libraryPrefSourceIndex: () => void,
    libraryRetrieveAllAlbums: () => Promise<Album[]>,
    libraryRetrieveAlbumById: (id: string) => Promise<Album | undefined>,
    libraryRetrieveAlbumImageById: (id: string) => Promise<string>,
    libraryRetrieveAlbumNameById: (id:string) => Promise<string>,
    libraryRetrieveArtistById: (id:string) => Promise<Artist | undefined>,
    libraryCreateNewPlaylist: (name:string) => void,
    libraryNotifyNewPlaylist: (callback) => void,
    libraryAddSongToPlaylist: (song: Song, playlistId:string) => void,
    libraryRetrieveAllPlaylists: () => Promise<Playlist[]>,
    libraryRetrieveAllPlaylistsNamesAndIds: () => Promise<any>,
    libraryRetrievePlaylistById: (id:string) => Promise<Playlist>, 
    queueUpdateQueueAndIndex: (newQueue: AudioBarSong[] | null, newIndex: number) => void,
    queueUpdateAddToQueue: (newSong: AudioBarSong) => void,
    queueRetrieveCurrent: () => Promise<[AudioBarSong, number]>,
    queueRetrieveCurrentLRC: (filePath:string) => Promise<LRCData>,
    queueNotifyAudioBar: (callback) => void, 
    queueNotifyAudioBarQueue: (callback) => void,
    queueNotifyTrackEnded: () => void,
    queueNotifySkipTracks: (tracksSkipped:number) => void,
    queueUpdateLoop: (newLoop: boolean) => void,
    queueUpdateShuffle: (newShuffle: boolean, currentIndex: number) => Promise<[AudioBarSong[], number]>,
    currentlyPlayingUpdateVisibility: (visibility:boolean) => void,
    currentlyPlayingReceiveVisibility: (callback) => void,
    pluginsNotifyUpdate: (callback) => void,
    pluginsAddSources: () => void,
    pluginsRetrieveSources: () => Promise<PluginSchema[]>,
    pluginsDeleteSource: (id:string) => void, 
    pluginsUpdateFields: (id:string, newFields:any) => void
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints