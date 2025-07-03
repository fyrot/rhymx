import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Song } from '../main/bgutils/songInformation';

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
      minimizeWindow: () => {ipcRenderer.send("minimizeWindow");},
      libraryPrefAddNewSource: ():Promise<string[]> => {return ipcRenderer.invoke("libraryPref:addNewSource")},
      libraryPrefRetrieveSourceList: () => {return ipcRenderer.invoke("libraryPref:retrieveSourceList");},
      libraryPrefUpdateSourceList: (sources:string[]) => {ipcRenderer.send("libraryPref:updateSourceList", sources);},
      libraryPrefSourceIndex: () => {ipcRenderer.send("libraryPref:sourceIndex");},
      libraryRetrieveAllAlbums: () => {return ipcRenderer.invoke("libraryRetrieve:allAlbums")},
      libraryRetrieveAlbumById: (id: string) => {return ipcRenderer.invoke("libraryRetrieve:albumById", id);},
      libraryRetrieveAlbumImageById: (id: string) => {return ipcRenderer.invoke("libraryRetrieve:albumImageById", id)},
      queueUpdateQueueAndIndex: (newQueue: Song[], newIndex: number) => {ipcRenderer.send("queue:updateQueueAndIndex", newQueue, newIndex);},
      queueRetrieveCurrent: () => {return ipcRenderer.invoke("queue:retrieveCurrent");},
      queueNotifyAudioBar: (callback) => {ipcRenderer.on("queue:notifyAudioBar", (_event) => {callback()});},
      queueNotifyTrackEnded: () => {ipcRenderer.send("queue:notifyTrackEnded");},
      queueNotifySkipTracks: (tracksSkipped: number) => {ipcRenderer.send("queue:notifySkipTracks", tracksSkipped);},
      pluginsAddSources: () => {ipcRenderer.send("plugins:addSources");}
    
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
