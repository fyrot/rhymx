import * as fs from "fs"
import { app } from "electron"
import { join, extname, basename } from "path"
import { Song, Album } from "./songInformation"
import * as jsmediatags from "jsmediatags"
import { TagType } from "jsmediatags/types"

export class LibraryManager {
  folderPaths: string[];
  audioFileFormats:Set<string> = new Set<string>([
    ".mp3", ".flac"
  ])  
  albumLibrary:Map<string, Album> = new Map<string, Album>()
  appDataPaths:Map<string, string> = new Map([
    ["libraryPrefFolders", join(app.getPath("userData"), "libraryPrefFolders.json")],
  ]); 
  constructor() {
    this.folderPaths = []
  }

  startup(): void {
    const libraryPrefFoldersPath = this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths";
    fs.readFile(libraryPrefFoldersPath, (error, data: NonSharedBuffer) => {
      if (error === null) {
        this.folderPaths = JSON.parse(data.toString("utf8"));
      }
    })
  }

  folderListRetrieve():string[] {
    return this.folderPaths;
  }
  folderListUpdate(sourceList:string[]):void {
      this.folderPaths = sourceList;
      const libraryPrefFoldersPath = this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths";
      fs.writeFile(libraryPrefFoldersPath, JSON.stringify(this.folderPaths), (error) => {
        if (error !== null) {
          console.log("Issues with writing to file @ " + libraryPrefFoldersPath)
          console.log(error);
        }
      });
  }
  stringCleaner(input: string):string {
    return input.trim()
  }
  folderIndexGenerateRandomId():string {
    /**putting this in its own function 
     * if i want to simplify the randomness
     *  to be more efficient  */
    return crypto.randomUUID();
  }
  async jsmediatagsPromise(songPath: string):Promise<TagType> {
    return new Promise<TagType>(function (resolve, reject) {
      jsmediatags.read(songPath, {
        onSuccess(data) {
          resolve(data)
        },
        onError(error) {
          reject(error);
        },
      })
    })
  }
  async folderIndex():Promise<void> {
    console.log("folder index reached");
    let songPathSet:Set<string> = new Set<string>();
    // note: forEach allows for 3 parameters: value, index, and array
    this.folderPaths.forEach((folder) => {
      fs.readdirSync(folder, {recursive: true, withFileTypes: true})
        .filter((file) => (file.isFile() && this.audioFileFormats.has(extname(file.name))))
        .map((file) => join(file.parentPath, file.name))
        .forEach((value) => {songPathSet.add(value)});
    })
    const songPathsUnique = songPathSet.values().toArray();
    let albumNameToIndex:Map<string, number> = new Map<string, number>();
    let albumList:Album[] = [];
    
    for (const songPath of songPathsUnique) {
          const data = await this.jsmediatagsPromise(songPath);
          //console.log(data.tags)
          let albumName = data.tags.album ?? "Download";
          const discNumber = "1";
          // jsmediatags does not support automatically reading disc number yet
          if (!albumNameToIndex.has(albumName)) {
            let newIndex = albumList.length;
            let newAlbum = <Album>{
              name: albumName,
              artists: [],
              discs: new Map<string, Song[]>(),
              albumImage: "",
              albumId: ""
            };
            albumList.push(newAlbum);
            console.log("pushed " + albumName);
            albumNameToIndex.set(albumName, newIndex);
          }
          let albumDiscs = albumList[albumNameToIndex.get(albumName)!].discs; 
          // ignoring possibility of null here w/ the ! operator, be wary
          if (!albumDiscs.has(discNumber)) {
            albumDiscs.set(discNumber, []);
          }
          const song = <Song>{
            name: data.tags.title ?? basename(songPath, extname(songPath)),
            artists: [data.tags.artist],
            albumRefId: data.tags.album ?? "Download",
            filePath: songPath,
            songId: ""            
          }
          // this works because an array is an object, so we get a reference
          // why am i saying "we"
          albumDiscs.get(discNumber)?.push(song);
    }
    console.log(albumList);
    let albumIdSet:Set<string> = new Set<string>();
    // generating unique identifier codes
    // practically very unlikely for a collision, so this is just for peace of mind lol
    for (let i = 0; i < albumList.length; i++) {
      let newId = this.folderIndexGenerateRandomId();
      while (albumIdSet.has(newId)) {
        newId = this.folderIndexGenerateRandomId();
        console.log(newId);
      }
      albumIdSet.add(newId);
      albumList[i].albumId = newId;
      this.albumLibrary.set(newId, albumList[i]);
    }
    console.log(this.albumLibrary);

  }
  libraryRetrieveAllAlbums():Album[] {
    return this.albumLibrary.values().toArray();
  }
  libraryRetrieveAlbumById(id: string):Album | undefined {
    return this.albumLibrary.get(id);
  }
}
