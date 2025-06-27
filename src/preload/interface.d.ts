export interface IElectronAPI {
    closeWindow: (shouldClose: boolean) => void,
    toggleMaximizeWindow: () => void,
    windowMaximized: (callback:any) => void,
    windowUnmaximized: (callback: any) => void
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints