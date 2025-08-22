import { app, shell, BrowserWindow, ipcMain, dialog, systemPreferences } from 'electron'
import { basename, extname, join, parse } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { LibraryManager } from './bgutils/LibraryManager';
import { Album, Artist, AudioBarSong, Song } from './bgutils/songInformation';
import { QueueManager } from './bgutils/QueueManager';
import EventEmitter from 'events';
import { LRCData } from './bgutils/LRCParserUtils';
import * as fs from "fs";
import AdmZip, * as admzip from "adm-zip";
import plugin from 'tailwindcss';
import { PluginFieldSchema, PluginSchema } from './bgutils/pluginInformation';
app.commandLine.appendSwitch("enable-features", "OverlayScrollbar")

class PluginEmitter extends EventEmitter {}
const pluginEmitter = new PluginEmitter();

let libraryManager = new LibraryManager();
let queueManager:QueueManager = new QueueManager();

let libraryFolderPaths:string[] = [];

libraryManager.startup();

let globalMainWindow:BrowserWindow; 

pluginsGetSourceFolders();
//pluginsRegisterPluginEvents();
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
  const current = await queueManager.retrieveCurrent();
  return current;
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
function libraryCreateNewPlaylist(event, name):void {
  libraryManager.libraryCreateNewPlaylist(name);
  globalMainWindow.webContents.send("library:notifyNewPlaylist");
}
function libraryAddSongToPlaylist(event, song, playlistId) {
  libraryManager.libraryAddSongToPlaylist(song, playlistId);
}
async function libraryRetrieveAllPlaylists(event) {
  return libraryManager.libraryRetrieveAllPlaylists();
}
async function libraryRetrieveAllPlaylistsNamesAndIds(event) {
  return libraryManager.libraryRetrieveAllPlaylistsNamesAndIds()
}
async function libraryRetrievePlaylistById(event, id) {
  return libraryManager.libraryRetrievePlaylistById(id);
}
function pluginsNotifyUpdate() {
  globalMainWindow.webContents.send("plugins:notifyUpdate")
}

function pluginsGetSourceFolders() {
  const pluginFolder = join(app.getPath("userData"), "plugins");
  if (!fs.existsSync(pluginFolder)) {
    fs.mkdirSync(pluginFolder);
  }
  console.log(pluginFolder);
  return fs.readdirSync(pluginFolder, {withFileTypes: true}).filter(directory => directory.isDirectory()).map(directory => join(directory.parentPath, directory.name));
}

function pluginsRegisterPluginEvents() {
  // we can run this at start-up
  const pluginFolders = pluginsGetSourceFolders();
  console.log("registering", pluginFolders)
  for (const folderPath of pluginFolders) {
    const pluginFilePath = join(folderPath, "plugin.js");
    
    if (fs.existsSync(pluginFilePath)) {
      const events = require(pluginFilePath);
      for (const eventPair of events.events) {
        console.log("registered", pluginFilePath);
        pluginEmitter.on(eventPair.eventName, (data) => {
          eventPair.callback(data);
        })
      }
    }
  }
}

function pluginsAddSources(event):void {
  dialog.showOpenDialog({

    properties: ["openFile", "dontAddToRecent", "multiSelections"]
    
    }).then((response) => {
      
      const pluginFolder = join(app.getPath("userData"), "plugins");
      if (!response.canceled) {
        console.log("response not cancelled");
        for (const providedFile of response.filePaths) {
          const zipFile = new AdmZip(providedFile);
          const zipDescriptorLocation = basename(providedFile, extname(providedFile)) +"/plugin.json";
          console.log(zipDescriptorLocation);
          const zipDescriptor = zipFile.getEntry(zipDescriptorLocation);
          if (zipDescriptor) {
            console.log("zip descriptor found")
            zipFile.extractAllTo(pluginFolder, true);

          }
        }
      }
      pluginsNotifyUpdate();
      // copy and extract the provided file into its own folder 
      /*if (!response.canceled) {
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
      }*/

    })
  }
async function pluginsRetrieveSources():Promise<PluginSchema[]> {
  const pluginFolderPath = join(app.getPath("userData"), "plugins");
  const pluginFolders = fs.readdirSync(pluginFolderPath, {withFileTypes: true});
  const PluginSchemaData:PluginSchema[] = [];
  for (const plugin of pluginFolders) {
    const descriptorPath = join(plugin.parentPath, plugin.name, "plugin.json")
    if (plugin.isDirectory() && fs.existsSync(descriptorPath)) {
      const pluginJSON = JSON.parse(fs.readFileSync(descriptorPath).toString("utf8"))
      PluginSchemaData.push({
        id: pluginJSON["id"] ?? "",
        displayName: pluginJSON["displayName"] ?? "",
        displayColor: pluginJSON["displayColor"] ?? "",
        fields: pluginJSON["fields"] ?? []
      });
    }
  }
  return PluginSchemaData;
}
function pluginDeleteSource(event, id):void {
  const pluginFolderPath = join(app.getPath("userData"), "plugins");
  const deletedPluginPath = join(pluginFolderPath, id);
  if (fs.existsSync(deletedPluginPath)) {
    fs.rmSync(deletedPluginPath, {recursive: true});

  }
  pluginsNotifyUpdate();

}
function pluginsUpdateFields(event, id, newFields) {
  const pluginJSONPath = join(app.getPath("userData"), "plugins", id, "plugin.json");
  console.log(pluginJSONPath)
  if (fs.existsSync(pluginJSONPath)) {
    const pluginJSON = JSON.parse(fs.readFileSync(pluginJSONPath).toString("utf8"))
    console.log("pluginJSON")
    const pluginJSONFields:PluginFieldSchema[] = pluginJSON["fields"];
    for (const entry of pluginJSONFields) {
      if (newFields[entry.label]) {
        entry.value = newFields[entry.label];
      }
    }
    console.log(pluginJSON)
    fs.writeFileSync(pluginJSONPath, JSON.stringify(pluginJSON));
    pluginsNotifyUpdate();
  }
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
  ipcMain.on("library:createNewPlaylist", libraryCreateNewPlaylist);
  ipcMain.on("library:addSongToPlaylist", libraryAddSongToPlaylist);
  ipcMain.handle("libraryRetrieve:allPlaylists", libraryRetrieveAllPlaylists)
  ipcMain.handle("libraryRetrieve:allPlaylistsNamesAndIds", libraryRetrieveAllPlaylistsNamesAndIds);
  ipcMain.handle("libraryRetrieve:playlistById", libraryRetrievePlaylistById);
  ipcMain.on("queue:updateQueueAndIndex", queueUpdateQueueAndIndex);
  ipcMain.on("queue:updateAddToQueue", queueUpdateAddToQueue);
  ipcMain.handle("queue:retrieveCurrent", queueRetrieveCurrent);
  ipcMain.handle("queue:retrieveCurrentLRC", queueRetrieveCurrentLRC);
  ipcMain.handle("queue:retrieveQueue", queueRetrieveQueue);
  ipcMain.on("queue:notifyTrackEnded", queueNotifyTrackEnded);
  ipcMain.on("queue:notifySkipTracks", queueNotifySkipTracks);
  ipcMain.on("currentlyPlaying:updateVisibility", currentlyPlayingUpdateVisibility);
  ipcMain.on("plugins:addSources", pluginsAddSources);
  ipcMain.handle("plugins:retrieveSources", pluginsRetrieveSources);
  ipcMain.on("plugins:deleteSource", pluginDeleteSource);
  ipcMain.on("plugins:updateFields", pluginsUpdateFields);
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
