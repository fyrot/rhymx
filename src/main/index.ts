import { app, shell, BrowserWindow, ipcMain, dialog, systemPreferences } from 'electron'
import { join, parse } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { LibraryManager } from './bgutils/LibraryManager';
import { Album, Artist, AudioBarSong, Song } from './bgutils/songInformation';
import { QueueManager } from './bgutils/QueueManager';
import EventEmitter from 'events';
import { LRCData } from './bgutils/LRCParserUtils';
app.commandLine.appendSwitch("enable-features", "OverlayScrollbar")

class PluginEmitter extends EventEmitter {}
const pluginEmitter = new PluginEmitter();

let libraryManager = new LibraryManager();
let queueManager:QueueManager = new QueueManager();

let libraryFolderPaths:string[] = [];

libraryManager.startup();

let globalMainWindow:BrowserWindow; 


function closeWindow(event, shouldClose):void {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
}
async function retrieveOS() {
  return process.platform.toString();
}

function queueNotifyAudioBar() {
  if (globalMainWindow !== undefined) {
    globalMainWindow.webContents.send("queue:notifyAudioBar");
  }

  pluginEmitter.emit("pluginEvents:currentlyPlayingChanged", queueManager.retrieveCurrent());
}
function queueNotifySkipTracks(event, tracksSkipped:number) {
  queueManager.skipTracks(tracksSkipped);
  queueNotifyAudioBar();
}

function queueUpdateQueueAndIndex(event, newQueue:AudioBarSong[] | null, newIndex:number):void {
  console.log("received queue and index");
  if (newQueue) {
    queueManager.updateQueue(newQueue);
  }
  queueManager.updateIndex(newIndex)
  queueNotifyAudioBar();
  globalMainWindow.webContents.send("queue:notifyAudioBarQueue", queueManager.retrieveQueue());
}
function queueUpdateAddToQueue(event, newSong:AudioBarSong):void {
  queueManager.addToQueue(newSong);
  globalMainWindow.webContents.send("queue:notifyAudioBarQueue", queueManager.retrieveQueue());

}

// invokes HAVE to be async
async function queueRetrieveCurrent(event):Promise<[AudioBarSong, number]> {
  return queueManager.retrieveCurrent();
}
async function queueRetrieveCurrentLRC(event, filePath:string):Promise<LRCData> {
  console.log(filePath);
  const parsedPath = parse(filePath);
  const lrcPath = join(parsedPath.dir, parsedPath.name) + ".lrc";
  return queueManager.retrieveCurrentLRC(lrcPath);
    
}
async function queueRetrieveQueue(event):Promise<AudioBarSong[]> {
  return queueManager.retrieveQueue();
}
function queueNotifyTrackEnded(event) {
  queueManager.trackEnded();
  queueNotifyAudioBar();
}
function currentlyPlayingUpdateVisibility(event, visibility: boolean):void {
  console.log("received update visibility");
  globalMainWindow.webContents.send("currentlyPlaying:receiveVisibility", visibility);
}

function toggleMaximizeWindow(event):void {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window !== undefined && window !== null) {
    if (window.isMaximized()) {window.unmaximize()}
    else {window.maximize();}
  }
}

function minimizeWindow(event:Electron.IpcMainEvent):void {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
}

async function libraryPrefRetrieveSourceList(event):Promise<string[]> {
  return libraryManager.folderListRetrieve();
}

async function libraryPrefUpdateSourceList(event, sourceList:string[]):Promise<void> {
  libraryManager.folderListUpdate(sourceList);
}

async function libraryPrefAddNewSource(event):Promise<string[]> {
  console.log("Adding new source");
  const window = BrowserWindow.fromWebContents(event.sender);
  let folderPaths = await dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"],
    buttonLabel: "Add",
    title: "Select a source folder"
  })
  console.log(folderPaths.filePaths);
  // if cancelled, this will still return an empty array
  return folderPaths.filePaths;
}

async function librarySourceIndex(event):Promise<void> {
  await libraryManager.folderIndex();
}
async function libraryRetrieveAllAlbums(event):Promise<Album[]> {
  return libraryManager.libraryRetrieveAllAlbums();
}
async function libraryRetrieveAlbumById(event, id):Promise<Album | undefined> {
  return libraryManager.libraryRetrieveAlbumById(id);
}
async function libraryRetrieveAlbumImageById(event, id):Promise<string> {
  console.log("id", id)
  return libraryManager.libraryRetrieveAlbumImageById(id) ?? "";
}
async function libraryRetrieveAlbumNameById(event, id):Promise<string> {
  console.log("retrieving name w/ id", id);
  return libraryManager.libraryRetrieveAlbumNameById(id) ?? "blah";
}
async function libraryRetrieveArtistById(event, id):Promise<Artist | undefined> {
  return libraryManager.libraryRetrieveArtistById(id);
}

function pluginsAddSources(event):void {
  dialog.showOpenDialog({

    properties: ["openFile", "dontAddToRecent", "multiSelections"]
      
    }).then((response) => {
      if (!response.canceled) {
        for (const filePath of response.filePaths) {
          const events = require(filePath);
          for (const eventPair of events.events) {
            console.log(eventPair);
            pluginEmitter.on(eventPair.eventName, (data) => {
            console.log("plugin received");
            eventPair.callback(data);
          });
        }

        }
      }
    })
  }



function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 600,
    minHeight: 400,
    show: false,
    frame: false,
    visualEffectState: "active",
    titleBarStyle: "hidden",
    trafficLightPosition: {x: 20, y:20},
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      webSecurity: false
      // webSecurity is set to false to test local resource loading
    }
  })
  
  mainWindow.webContents.on("did-finish-load", () => {
    globalMainWindow = mainWindow;
    mainWindow.webContents.openDevTools();
  });
// if permissions are behaving weirdly, double check effects of sandbox + context isolation
  mainWindow.on('ready-to-show', () => {
    
    mainWindow.show()
    
  })
  
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("windowMaximized");
  })
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("windowUnmaximized");
    /* 
    i was wondering why this wasn't working
    until i realized this used to send the same message
    as the maximize event

    oops
    */
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  //ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on("closeWindow", closeWindow);
  ipcMain.on("toggleMaximizeWindow", toggleMaximizeWindow);
  ipcMain.on("minimizeWindow", minimizeWindow);
  ipcMain.handle("retrieveOS", retrieveOS); 
  ipcMain.handle("libraryPref:addNewSource", libraryPrefAddNewSource);
  ipcMain.handle("libraryPref:retrieveSourceList", libraryPrefRetrieveSourceList);
  ipcMain.on("libraryPref:updateSourceList", libraryPrefUpdateSourceList);
  ipcMain.on("libraryPref:sourceIndex", librarySourceIndex);
  ipcMain.handle("libraryRetrieve:allAlbums", libraryRetrieveAllAlbums);
  ipcMain.handle("libraryRetrieve:albumById", libraryRetrieveAlbumById);
  ipcMain.handle("libraryRetrieve:albumImageById", libraryRetrieveAlbumImageById);
  ipcMain.handle("libraryRetrieve:albumNameById", libraryRetrieveAlbumNameById);
  ipcMain.handle("libraryRetrieve:artistById", libraryRetrieveArtistById);
  ipcMain.on("queue:updateQueueAndIndex", queueUpdateQueueAndIndex);
  ipcMain.on("queue:updateAddToQueue", queueUpdateAddToQueue);
  ipcMain.handle("queue:retrieveCurrent", queueRetrieveCurrent);
  ipcMain.handle("queue:retrieveCurrentLRC", queueRetrieveCurrentLRC);
  ipcMain.handle("queue:retrieveQueue", queueRetrieveQueue);
  ipcMain.on("queue:notifyTrackEnded", queueNotifyTrackEnded);
  ipcMain.on("queue:notifySkipTracks", queueNotifySkipTracks);
  ipcMain.on("currentlyPlaying:updateVisibility", currentlyPlayingUpdateVisibility);
  ipcMain.on("plugins:addSources", pluginsAddSources);
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
