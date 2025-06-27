export interface IElectronAPI {
    closeWindow: (shouldClose: boolean) => void,
    toggleMaximizeWindow: () => void
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}

// i have no idea if this is right but it resolved the typescript compiler's complaints