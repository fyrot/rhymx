import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs';
import { LibraryManager } from './bgutils/LibraryManager';
import { Album } from './bgutils/songInformation';


let libraryManager = new LibraryManager();

let libraryFolderPaths:string[] = [];

libraryManager.startup();

function closeWindow(event, shouldClose):void {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
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
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true
    }
  })
  
  mainWindow.webContents.on("did-finish-load", () => {
    
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
  ipcMain.handle("libraryPref:addNewSource", libraryPrefAddNewSource);
  ipcMain.handle("libraryPref:retrieveSourceList", libraryPrefRetrieveSourceList);
  ipcMain.on("libraryPref:updateSourceList", libraryPrefUpdateSourceList);
  ipcMain.on("libraryPref:sourceIndex", librarySourceIndex);
  ipcMain.handle("libraryRetrieve:allAlbums", libraryRetrieveAllAlbums);
  ipcMain.handle("libraryRetriev:albumById", libraryRetrieveAlbumById);
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
