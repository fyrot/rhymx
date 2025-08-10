import * as fs from "fs"
import { app } from "electron"
import { join, extname, basename, format, parse } from "path"
import { pathToFileURL } from "url"
import { Song, Album, AudioBarSong, Artist, Playlist } from "./songInformation"
import * as jsmediatags from "jsmediatags"
import { TagType } from "jsmediatags/types"
import { parseFile } from "music-metadata"

const AppDataPaths = {
  LibraryFolders: join(app.getPath("userData"),  "libraryPrefFolders.json"),
  AlbumLibrary: join(app.getPath("userData"), "albumLibrary.json"),
  PlaylistLibrary: join(app.getPath("userData"), "playlistLibrary.json")

}
export class LibraryManager {
  
  folderPaths: string[]
  audioFileFormats: Set<string> = new Set<string>([".mp3", ".flac"])
  albumLibrary: Map<string, Album> = new Map<string, Album>()
  playlistLibrary: Map<string, Playlist> = new Map<string, Playlist>();
  /*appDataPaths: Map<string, string> = new Map([
    ["libraryPrefFolders", join(app.getPath("userData"), "libraryPrefFolders.json")],
    ["albumLibrary", join(app.getPath("userData"), "albumLibrary.json")],
    ["playlistLibrary", join(app.getPath("userData"), "playlistLibrary.json")]
  ])*/
  artistLibrary: Map<string, Artist> = new Map<string, Artist>()
  constructor() {
    this.folderPaths = []
  }

  startup(): void {
    const libraryPrefFoldersPath = AppDataPaths.LibraryFolders; // this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths"
    fs.readFile(libraryPrefFoldersPath, (error, data: NonSharedBuffer) => {
      if (error === null) {
        this.folderPaths = JSON.parse(data.toString("utf8"))
      }
    })
    fs.readFile(AppDataPaths.PlaylistLibrary, (error, data) => {
      if (error === null) {
        this.playlistLibrary = new Map(Object.entries(JSON.parse(data.toString("utf8"))));
        console.log(typeof this.playlistLibrary);
        console.log(this.playlistLibrary)
      }
    })
    
  }

  folderListRetrieve(): string[] {
    return this.folderPaths
  }
  folderListUpdate(sourceList: string[]): void {
    this.folderPaths = sourceList
    const libraryPrefFoldersPath = AppDataPaths.LibraryFolders; //this.appDataPaths.get("libraryPrefFolders") ?? "Check LibraryManager appDataPaths"
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
      console.log(folder);
      console.log(fs.readdirSync(folder, {recursive: true, withFileTypes: true}));
      
      fs.readdirSync(folder, { recursive: true, withFileTypes: true })

      .filter((file) => file.isFile() && this.audioFileFormats.has(extname(file.name)))
      .map((file) => join(file.parentPath, file.name))
      .forEach((value) => { 
        console.log(value);
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
        splitString = splitString.replaceAll(delimiter, defaultDelimiter);
      }
      let unsanitizedSplit = splitString.split(defaultDelimiter).map((val) => val.trim());
      return unsanitizedSplit.filter((value) => value.length > 0);
    }
    const usedDelimiters = [",", ";", "\0", "\\", "/"];
    const defaultDelimiter = ",";
    const promiseBatchSize = 200;
    console.log("batch size: ", songPathsUnique.length/promiseBatchSize)
    for (let i = 0; i < songPathsUnique.length/promiseBatchSize; i++) {
      console.log("new batch");
      await Promise.all(songPathsUnique.slice((i*promiseBatchSize), Math.min(songPathsUnique.length, ((i+1)*promiseBatchSize))).map((filePath) => new Promise<void>(function (resolve, reject) {
        parseFile(filePath, {duration: true}).then((metadata) => {
          const albumName = metadata.common.album ?? "Download";
          if (!albumNameToIndex.has(albumName)) {
            const newIndex = albumList.length;
            const newAlbum = <Album>{
              name: albumName,
              artists: [],
              discs: new Map<string, Song[]>(),
              albumImage: {
                hasData: false,
                dataUrl: ""
              },
              albumId: ""
            }
            albumList.push(newAlbum);
            console.log("pushed album")
            albumNameToIndex.set(albumName, newIndex);
          }
          const currentAlbum = albumList[albumNameToIndex.get(albumName)!];
          if (!currentAlbum.albumImage.hasData && (metadata.common.picture && metadata.common.picture.length > 0)) {
            const format = metadata.common.picture[0].format;
            const base64string = Buffer.from(metadata.common.picture[0].data).toString("base64");
            currentAlbum.albumImage.hasData = true;
            currentAlbum.albumImage.dataUrl = `data:${format};base64,${base64string}`;
            console.log("i'd log the picture here");
          }
          const discNumber = metadata.common.disk.no ?? 1
          const discNumberString = discNumber.toString();
          if (!currentAlbum.discs.has(discNumberString)) {
            currentAlbum.discs.set(discNumberString, []);
          }
          const parsedPath = parse(filePath);
          const lrcPath = join(parsedPath.dir, parsedPath.name) + ".lrc";
         
          const lrcAttachmentExists = fs.existsSync(lrcPath);
          
          let processedArtists:string[] = sanitizedMultiSplit(usedDelimiters, defaultDelimiter, (metadata.common.artists ?? ["Unknown"]).join(", "))
          console.log(filePath);
          const song = <Song>{
            name: metadata.common.title ?? basename(filePath, extname(filePath)),
            trackNo: metadata.common.track.no ?? 1,
            artists: processedArtists,
            albumRefId: albumName,
            filePath: pathToFileURL(filePath).href,
            path: filePath,
            songId: "",
            duration: metadata.format.duration ?? 0,
            hasLRC: lrcAttachmentExists
          }
          currentAlbum.discs.get(discNumberString)?.push(song);
          // trying porting the later stuff and see what happens
          resolve();
        }).catch((error) => {console.log(error);reject();});
      }
      )))
    }
    const perfTimestampEnd = Date.now();
    console.log("Indexing time: " + (perfTimestampEnd-perfTimestampStart).toString()+"ms");
    
    //console.log(albumList);
    let albumIdSet: Set<string> = new Set<string>()
    let temporaryArtistLibrary = new Map<string, Set<string>>()
    let temporaryArtistName = new Map<string, string>();
    // generating unique identifier codes
    // practically very unlikely for a collision, so this is just for peace of mind lol
    for (let i = 0; i < albumList.length; i++) {
      let newId = albumList[i].name.replaceAll("_", "__").replaceAll(" ", "_");
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
              song.albumRefId = album.albumId;
              song.artists.forEach((artist:string) => {
                artistSet.add(artist);
                const artistUnderscore = artist.replaceAll(" ", "_");
                if (!temporaryArtistName.has(artistUnderscore)) {
                  temporaryArtistName.set(artistUnderscore, artist);
                }
                if (!temporaryArtistLibrary.has(artistUnderscore)) {
                  temporaryArtistLibrary.set(artistUnderscore, new Set<string>())
                }
                temporaryArtistLibrary.get(artistUnderscore)?.add(album.albumId);
              })
          })
          
          }
          album.artists = artistSet.values().toArray();
        }
      }

      this.albumLibrary.set(newId, albumList[i])
    }
    temporaryArtistLibrary.forEach((set, key) => {
      this.artistLibrary.set(key, <Artist>{
        artistId: key,
        name: temporaryArtistName.get(key),
        discography: set.values().toArray()
      })
    })
    console.log(temporaryArtistLibrary);
  }
  libraryRetrieveAllAlbums(): Album[] {
    return this.albumLibrary.values().toArray()
  }
  libraryRetrieveAlbumById(id: string): Album | undefined {
    return this.albumLibrary.get(id)
  }
  libraryRetrieveAlbumImageById(id: string):string | undefined {
    return this.albumLibrary.get(id)?.albumImage.dataUrl;
  }
  libraryRetrieveAlbumNameById(id:string):string | undefined {
    return this.albumLibrary.get(id)?.name;
  }
  libraryRetrieveArtistById(id:string):Artist | undefined {
    return this.artistLibrary.get(id)
  }
  libraryCreateNewPlaylist(name:string):void {
    let playlistId = name.replaceAll("_", "__").replaceAll(" ", "_");
    console.log(typeof playlistId);
    console.log(typeof this.playlistLibrary);
    while (this.playlistLibrary.has(playlistId) == true) {
      playlistId += "0";
    }
    const playlist:Playlist = {
      name: name,
      albumImage: {
        hasData: false,
        dataUrl: ""
      },
      songs: [],
      playlistId: playlistId
    }
    this.playlistLibrary.set(playlistId, playlist);
    // persisted storage
    this.librarySavePlaylists();
  }
  librarySavePlaylists():void {
    const objectJSON = {};
    for (const pair of this.playlistLibrary.entries()) {
      objectJSON[pair[0]] = pair[1];
      // assigning value to key
    }
    console.log(objectJSON)
    fs.writeFileSync(AppDataPaths.PlaylistLibrary, JSON.stringify(objectJSON));
    console.log(AppDataPaths.PlaylistLibrary);
    console.log("saved updated playlists");
  }
  libraryRetrieveAllPlaylists():Playlist[] {
    return this.playlistLibrary.values().toArray();
  }
  libraryAddSongToPlaylist(song:Song, playlistId:string):void {
    this.playlistLibrary.get(playlistId)?.songs.push(song);
    this.librarySavePlaylists();
  }
  libraryRetrieveAllPlaylistsNamesAndIds() {
    return this.playlistLibrary.keys().map((key) => {return {
      name: this.playlistLibrary.get(key)?.name ?? "Error",
      key: key
    }}).toArray();
  }
  libraryRetrievePlaylistById(id:string) {
    return this.playlistLibrary.get(id);
  }
}
