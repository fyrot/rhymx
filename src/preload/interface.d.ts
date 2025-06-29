import { Album } from "../main/bgutils/songInformation";
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
    libraryRetrieveAlbumById: (id: string) => Promise<Album | undefined>
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints