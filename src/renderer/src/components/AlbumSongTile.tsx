import { AudioBarSong, Song } from "src/main/bgutils/songInformation"
import { QueueIdentifier } from "@renderer/QueueIdentifier"
import { LuChevronLeft, LuEllipsisVertical, LuPlay } from "react-icons/lu"
import { toast } from "sonner";
import { queueToast } from "@renderer/helper/QueueToast";
import * as ContextMenu from "@radix-ui/react-context-menu";

import { useState } from "react";
function timeToMMSS(seconds: number):string {
  const mm = Math.floor(seconds/60);
  const ss = Math.round(seconds-(60*mm));
  return mm.toString() + ":" + (ss < 10 ? "0" + ss.toString() : ss.toString());
}
interface PlaylistNameAndId {
  name: string,
  key: string
}
const AlbumSongTile = ({ song, trackNo, playFunction}: { song: Song; trackNo: number, playFunction:any }) => {
  const [retrievedPlaylists, updateRetrievedPlaylists] = useState<PlaylistNameAndId[]>([]);
  const [contextOpen, updateContextOpen] = useState(false);
  const playSong = async () => {
    playFunction();
    /*const album = await window.electronAPI.libraryRetrieveAlbumById(song.albumRefId);
    const audioBarQueue:AudioBarSong[] = [];
    let index = 0;
    let playIndex = 0;
    album?.discs.entries().forEach((pair) => {
      pair[1].forEach((item) => {
        if (item.filePath == song.filePath) {
          playIndex = index;
        }
        audioBarQueue.push({
          song: item,
          albumImage: album.albumImage,
          albumName: album.name 
        })
        index++;
      })
    });
    window.electronAPI.queueUpdateQueueAndIndex(audioBarQueue,playIndex);
    console.log(song)*/
  }
  const addToQueue = async () => {
    
    const album = await window.electronAPI.libraryRetrieveAlbumById(song.albumRefId);
    console.log("adding to queue")
    
    //const albumImage = await window.electronAPI.libraryRetrieveAlbumImageById(song.albumRefId);
    const albumImage = await window.electronAPI.libraryRetrieveAlbumImageLowResById(song.albumRefId);
    
    //console.log("Old: %d \n New: %d", albumImage2.length, albumImage.length);
    
    console.log(albumImage.slice(0,20));
    if (album) {
      
      window.electronAPI.queueUpdateAddToQueue({
        song: song,
        albumImage: {
          hasData: true,
          dataUrl: albumImage
        },
        albumName: album.name,
        identifier: QueueIdentifier.generateIdentifier()
      })
      queueToast({title: song.name, description: "added to queue", background: "#121212"})
      //toast(`${song.name} added to queue.`);
    }
  }
  const retrievePlaylists = () => {
    window.electronAPI.libraryRetrieveAllPlaylistsNamesAndIds().then((response) => {
      const newPlaylists:PlaylistNameAndId[] = response;
      updateRetrievedPlaylists(newPlaylists);
    });
  }
  return (
    <div className={`items-center w-full p-1 rounded-xl album-song-tile-styles`}>
      <div className="flex album-song-tile-row-container flex-row gap-x-4 items-center">
        <div
          onClick={playSong}
          onContextMenuCapture={addToQueue}
          className="album-numplay-click-container flex p-2  rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-black hover:bg-opacity-50 "
        >
          <div className="flex grow items-center album-numplay-container w-8 h-8 justify-center">
            <h1 className="album-numplay-num-hide-on-tile-hover font-bold">{trackNo}</h1>
            <LuPlay className="album-numplay-play-show-on-tile-hover text-xl" />
          </div>
        </div>

        <div className="hidden grow flex-row lg:flex">
          <h1 className="leading-5 basis-1/2 grow line-clamp-1 font-semibold tracking-tight">{song.name}</h1>
          <h1 className="leading-5 basis-1/2 grow font-light text-sm">{song.artists.join(", ")}</h1>
          
        </div>

        <div className="inline-flex grow flex-row lg:hidden">
          
            <div className="flex flex-col">
            <h1 className="leading-5 line-clamp-1 font-semibold">{song.name}</h1>
            <h1 className="leading-5 text-sm">{song.artists.join(", ")}</h1>
          </div>
          <div className="grow" />
          
        </div>

        <div>
          <h1>{timeToMMSS(song.duration)}</h1>
        </div>
        <div className="album-ell-hide-on-tile-hover">
          <ContextMenu.Root dir="rtl" onOpenChange={(open) => {
            retrievePlaylists();
            updateContextOpen(open);
          }}>
            <ContextMenu.Trigger>
              <LuEllipsisVertical className="text-xl" />
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className="bg-black-translucent min-w-40 p-2 rounded-2xl backdrop-blur-lg shadow-lg">
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger asChild>
                    <ContextMenu.Item className="bg-black bg-opacity-0 p-2 rounded-2xl transition-all hover:bg-opacity-50 flex items-center">
                      Add to playlist <span className="mr-auto pr-4 inline-block"><LuChevronLeft /></span>
                    </ContextMenu.Item>
                    
                  </ContextMenu.SubTrigger>
                  <ContextMenu.Portal>
                    <ContextMenu.SubContent
                    alignOffset={-8}
                    sideOffset={20}
                    className="bg-black-translucent min-w-40 p-2 rounded-2xl backdrop-blur-sm shadow-lg"
                    >
                      {retrievedPlaylists.map((bundle) => (
                        <ContextMenu.Item key={bundle.key} className="bg-black bg-opacity-0 p-2 rounded-2xl transition-all hover:bg-opacity-50" onClickCapture={() => {
                          window.electronAPI.libraryAddSongToPlaylist(song, bundle.key)
                        }}>
                          {bundle.name}
                        </ContextMenu.Item>  
                      ))}
                      
                    </ContextMenu.SubContent>
                  </ContextMenu.Portal>
                </ContextMenu.Sub>

                <ContextMenu.Item onClick={addToQueue} className="bg-black bg-opacity-0 p-2 rounded-2xl transition-all hover:bg-opacity-50">
                  Add to queue <div>
                    
                  </div>
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
          
        </div>
        <div />
      </div>
    </div>
  )
}
export default AlbumSongTile
