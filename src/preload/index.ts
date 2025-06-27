import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      closeWindow: (redundant) => {ipcRenderer.send("closeWindow", redundant);},
      toggleMaximizeWindow: () => {ipcRenderer.send("toggleMaximizeWindow");},
      windowMaximized: (callback) => {ipcRenderer.on("windowMaximized", callback);},
      windowUnmaximized: (callback) => {ipcRenderer.on("windowUnmaximized", callback);},
      minimizeWindow: () => {ipcRenderer.send("minimizeWindow");}
    })
  } catch (error) {
    console.log(error);
  }
}

/*if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  throw new Error('contextIsolation must be enabled in the browser window')

}*/
