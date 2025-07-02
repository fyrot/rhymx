import * as fs from "fs"
import { app } from "electron"
import { join, extname, basename } from "path"
import { Song, Album } from "./songInformation"
import * as jsmediatags from "jsmediatags"
import { TagType } from "jsmediatags/types"

export class LibraryManager {
  folderPaths: string[]
  audioFileFormats: Set<string> = new Set<string>([".mp3", ".flac"])
  albumLibrary: Map<string, Album> = new Map<string, Album>()
  appDataPaths: Map<string, string> = new Map([
    ["libraryPrefFolders", join(app.getPath("userData"), "libraryPrefFolders.json")]
  ])
  constructor() {
    this.folderPaths = []
  }

  startup(): void {
    const libraryPrefFoldersPath =
      this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths"
    fs.readFile(libraryPrefFoldersPath, (error, data: NonSharedBuffer) => {
      if (error === null) {
        this.folderPaths = JSON.parse(data.toString("utf8"))
      }
    })
  }

  folderListRetrieve(): string[] {
    return this.folderPaths
  }
  folderListUpdate(sourceList: string[]): void {
    this.folderPaths = sourceList
    const libraryPrefFoldersPath =
      this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths"
    fs.writeFile(libraryPrefFoldersPath, JSON.stringify(this.folderPaths), (error) => {
      if (error !== null) {
        console.log("Issues with writing to file @ " + libraryPrefFoldersPath)
        console.log(error)
      }
    })
  }
  stringCleaner(input: string): string {
    return input.trim()
  }
  folderIndexGenerateRandomId(): string {
    /**putting this in its own function
     * if i want to simplify the randomness
     *  to be more efficient  */
    return crypto.randomUUID()
  }
  async jsmediatagsPromise(songPath: string): Promise<TagType> {
    return new Promise<TagType>(function (resolve, reject) {
      jsmediatags.read(songPath, {
        onSuccess(data) {
          resolve(data)
        },
        onError(error) {
          reject(error)
        }
      })
    })
  }
  async folderIndex(): Promise<void> {
    this.albumLibrary.clear()
    console.log("folder index reached")
    let songPathSet: Set<string> = new Set<string>()
    // note: forEach allows for 3 parameters: value, index, and array
    this.folderPaths.forEach((folder) => {
      fs.readdirSync(folder, { recursive: true, withFileTypes: true })
        .filter((file) => file.isFile() && this.audioFileFormats.has(extname(file.name)))
        .map((file) => join(file.parentPath, file.name))
        .forEach((value) => {
          songPathSet.add(value)
        })
    })
    const songPathsUnique = songPathSet.values().toArray()
    let albumNameToIndex: Map<string, number> = new Map<string, number>()
    let albumList: Album[] = []
    const perfTimestampStart = Date.now();
    // doing them all like this yields memory errors, need to implement batch processing just so we don't overload the servers
    // though this is incredibly more performant -- even without the separate promise optimizations done earlier
    // it processed about 100+ .flacs and a few mp3s in half a second sheeeesh
    function sanitizedMultiSplit(delimiters:string[], defaultDelimiter:string, splitString:string):string[] {
      for (const delimiter of delimiters) {
        splitString = splitString.replace(delimiter, defaultDelimiter);
      }
      let unsanitizedSplit = splitString.split(defaultDelimiter);
      return unsanitizedSplit.filter((value) => value.trim().length > 0);
    }
    const usedDelimiters = [",", ";", "\0"];
    const defaultDelimiter = ",";
    // ignore later commented out code, for reference
    await Promise.all(songPathsUnique.map(songPath => new Promise<TagType>(function (resolve, reject) {
      jsmediatags.read(songPath, {
        onSuccess(data) {
          let albumName = data.tags.album ?? "Download";
          const discNumber = "1";
          // jsmediatags does not support automatically reading disc number yet
          if (!albumNameToIndex.has(albumName)) {
            let newIndex = albumList.length;
            let newAlbum = <Album>{
              name: albumName,
              artists: [],
              discs: new Map<string, Song[]>(),
              albumImage: {
                hasData: false,
                dataUrl: ""
              },
              albumId: ""
            };
            albumList.push(newAlbum);
            console.log("pushed " + albumName);
            albumNameToIndex.set(albumName, newIndex);
          }
          let albumItem = albumList[albumNameToIndex.get(albumName)!];
          if (albumItem.albumImage.dataUrl.length == 0 && (data.tags.picture?.data !== undefined && data.tags.picture.data.length > 0)) {
            console.log("Album art found!!");
            //console.log(data.tags.picture.data);
            const imageFormat = data.tags.picture.format;
            const base64string = Buffer.from(new Uint8Array(data.tags.picture.data)).toString("base64");
            albumItem.albumImage.dataUrl = `data:${imageFormat};base64,${base64string}`;
          }
          // ignoring possibility of null here w/ the ! operator, be wary
          if (!albumItem.discs.has(discNumber)) {
            albumItem.discs.set(discNumber, []);
          }
          const artistsList = sanitizedMultiSplit(usedDelimiters, defaultDelimiter, data.tags.artist ?? "Unknown");
          const song = <Song>{
            name: data.tags.title ?? basename(songPath, extname(songPath)),
            artists: artistsList,
            albumRefId: data.tags.album ?? "Download",
            filePath: songPath,
            songId: ""            
          }
          // this works because an array is an object, so we get a reference
          // why am i saying "we"
          albumItem.discs.get(discNumber)?.push(song);
          resolve(data);
        }, onError(error) {
          reject(error)
        }
      })
    })));
    
    /*for (const songPath of songPathsUnique) {
      const cheapTags = await new Promise<TagType>(function (resolve, reject) {
        new jsmediatags.Reader(songPath)
        .setTagsToRead(["title", "artist", "album", "track"])
        .read({
          onSuccess(data) {
            let albumName = data.tags.album ?? "Download"
            const discNumber = "1"
            // jsmediatags does not support automatically reading disc number yet
            if (!albumNameToIndex.has(albumName)) {
              let newIndex = albumList.length
              let newAlbum = <Album>{
                name: albumName,
                artists: [],
                discs: new Map<string, Song[]>(),
                albumImage: {
                  hasData: false,
                  dataUrl: ""
                },
                albumId: ""
              }
              albumList.push(newAlbum)
              console.log("pushed " + albumName)
              albumNameToIndex.set(albumName, newIndex)
            }
            let albumItem = albumList[albumNameToIndex.get(albumName)!]
            if (!albumItem.discs.has(discNumber)) {
              albumItem.discs.set(discNumber, [])
            }
            const song = <Song>{
              name: data.tags.title ?? basename(songPath, extname(songPath)),
              trackNo: data.tags.track ?? 1,
              artists: [data.tags.artist],
              albumRefId: data.tags.album ?? "Download",
              filePath: songPath,
              songId: ""
            }
            // this works because an array is an object, so we get a reference
            // why am i saying "we"
            albumItem.discs.get(discNumber)?.push(song)
            resolve(data);
          },
          onError(error) {
            console.log("Error found: ", error.type, error.info);
            reject(error);
          }
        });
      })
      const albumItem = albumList[albumNameToIndex.get(cheapTags.tags.album ?? "Download")!];
      if (albumItem.albumImage.hasData == false) {
        console.log("searching for image..");
        await new Promise<void>(function (resolve, reject) {
          new jsmediatags.Reader(songPath)
          .setTagsToRead(["picture"])
          .read({
            onSuccess(data) {
              if (data.tags.picture?.data !== undefined && data.tags.picture.data.length > 0) {
                console.log("Album art found!!")
                //console.log(data.tags.picture.data);
                const imageFormat = data.tags.picture.format
                const base64string = Buffer.from(new Uint8Array(data.tags.picture.data)).toString("base64")
                albumItem.albumImage.dataUrl = `data:${imageFormat};base64,${base64string}`
                albumItem.albumImage.hasData = true;
              }
              resolve();
            },
            onError(error) {
              console.log("Error found:", error.type, error.info);
              reject();
            }
          })
        });
      }
      
    }*/
    /*for (const songPath of songPathsUnique) {
     const data = await this.jsmediatagsPromise(songPath)

      //console.log(data.tags)
      let albumName = data.tags.album ?? "Download"
      const discNumber = "1"
      // jsmediatags does not support automatically reading disc number yet
      if (!albumNameToIndex.has(albumName)) {
        let newIndex = albumList.length
        let newAlbum = <Album>{
          name: albumName,
          artists: [],
          discs: new Map<string, Song[]>(),
          albumImage: {
            hasData: false,
            dataUrl: ""
          },
          albumId: ""
        }
        albumList.push(newAlbum)
        console.log("pushed " + albumName)
        albumNameToIndex.set(albumName, newIndex)
      }
      let albumItem = albumList[albumNameToIndex.get(albumName)!]
      if (
        albumItem.albumImage.dataUrl.length == 0 &&
        data.tags.picture?.data !== undefined &&
        data.tags.picture.data.length > 0
      ) {
        console.log("Album art found!!")
        //console.log(data.tags.picture.data);
        const imageFormat = data.tags.picture.format
        const base64string = Buffer.from(new Uint8Array(data.tags.picture.data)).toString("base64")
        albumItem.albumImage.dataUrl = `data:${imageFormat};base64,${base64string}`
      }
      // ignoring possibility of null here w/ the ! operator, be wary
      if (!albumItem.discs.has(discNumber)) {
        albumItem.discs.set(discNumber, [])
      }

      const song = <Song>{
        name: data.tags.title ?? basename(songPath, extname(songPath)),
        trackNo: data.tags.track ?? 1,
        artists: [data.tags.artist],
        albumRefId: data.tags.album ?? "Download",
        filePath: songPath,
        songId: ""
      }
      // this works because an array is an object, so we get a reference
      // why am i saying "we"
      albumItem.discs.get(discNumber)?.push(song)
    }*/
    const perfTimestampEnd = Date.now();
    console.log("Indexing time: " + (perfTimestampEnd-perfTimestampStart).toString()+"ms");
    
    //console.log(albumList);
    let albumIdSet: Set<string> = new Set<string>()
    // generating unique identifier codes
    // practically very unlikely for a collision, so this is just for peace of mind lol
    for (let i = 0; i < albumList.length; i++) {
      let newId = this.folderIndexGenerateRandomId()
      while (albumIdSet.has(newId)) {
        newId = this.folderIndexGenerateRandomId()
        console.log(newId)
      }
      albumIdSet.add(newId)
      albumList[i].albumId = newId

      if (true) {
        const keys = albumList[i].discs.keys().toArray();
        for (const key of keys) {
          // using the ! here to disable undefined guard, since these keys have to be in the di
          albumList[i].discs.get(key)!.sort((a, b) => {
            if (a.trackNo != b.trackNo) {
              return a.trackNo - b.trackNo; 
            } else {
              if (a.name < b.name) {
                return -1;
              } else if (a.name > b.name) {
                return 1;
              } else {return 0;}
            }
          })
        }
      }
      
      if (true) {
        for (const album of albumList) {
          let artistSet: Set<string> = new Set<string>();
          const allAlbumDiscs = [...album.discs.values()];
          for (const disc of allAlbumDiscs) {
            // write this better later
            disc.forEach((song:Song) => {
            song.artists.forEach((artist:string) => {artistSet.add(artist);})
          })
          
          }
          album.artists = artistSet.values().toArray();
        }
      }

      this.albumLibrary.set(newId, albumList[i])
    }
  }
  libraryRetrieveAllAlbums(): Album[] {
    return this.albumLibrary.values().toArray()
  }
  libraryRetrieveAlbumById(id: string): Album | undefined {
    return this.albumLibrary.get(id)
  }
}
