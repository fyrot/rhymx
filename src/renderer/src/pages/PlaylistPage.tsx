import AlbumSongTile from "@renderer/components/AlbumSongTile"
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useEffect, useState, useLayoutEffect } from "react"
import { LuDisc } from "react-icons/lu"
import { useParams, useSearchParams } from "react-router"
import { Playlist, AudioBarSong } from "src/main/bgutils/songInformation"
export default function PlaylistPage() {
  const [abc, setAbc] = useSearchParams()
  const [playlist, updatePlaylist] = useState<Playlist>()
  useLayoutEffect(() => {
    // using ! operator here because it should be in there
    window.electronAPI
      .libraryRetrievePlaylistById(abc.get("id")!)
      .then((val) => {
        updatePlaylist(val)
        console.log(val);
        console.log(val?.name)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [abc])

  const playPlaylist = async (index:number) => {
    /* */
    const newQueue:AudioBarSong[] = [];
    for (const song of playlist?.songs ?? []) {
      const albumImageData = await window.electronAPI.libraryRetrieveAlbumImageById(song.albumRefId);
      const albumName = await window.electronAPI.libraryRetrieveAlbumNameById(song.albumRefId);
      newQueue.push({
        song: song,
        albumImage: {dataUrl: albumImageData, hasData: albumImageData != ""},
        albumName: albumName
      })
    }
    window.electronAPI.queueUpdateQueueAndIndex(newQueue, index);
    console.log(index);
  }

  return (
    <div>
      <div>
        <div className="min-h-screen flex flex-col bg-neutral-800 ">
          <div className="hidden lg:inline">
            <div
              className="w-full relative inline-flex"
              style={{
                backgroundImage: `url(${playlist?.albumImage.dataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="grow album-image-parallax-bar flex flex-col">
                <NavigationBarSpacer accentGradient={false} />
                <div className="w-full flex flex-row px-8">
                  <div
                    className="md:w-[min(40vh,20rem)] md:h-[min(40vh,20rem)] flex-shrink-0 rounded-xl shadow-2xl drop-shadow-2xl -mb-16"
                    style={{
                      backgroundImage: `url(${playlist?.albumImage.dataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="flex flex-col-reverse pl-4 flex-">
                    <h1 className="album-title-name-shadow text-left text-[min(4rem,max(10vh,2rem))]  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {playlist?.name}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16">
              <h1 className="md:pl-[calc(2rem+min(40vh,20rem)+1rem)] opacity-70 text-left leading-loose text-nowrap text-ellipsis w-full overflow-x-hidden">
                artists here
              </h1>
            </div>
          </div>

          <div className="inline lg:hidden">
            <div
              className="w-full relative inline-flex "
              style={{
                backgroundImage: `url(${playlist?.albumImage.dataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="grow album-image-parallax-bar flex flex-col">
                <NavigationBarSpacer accentGradient={false} />
                <div className="w-full flex flex-col items-center px-8 pt-2">
                  <div
                    className="w-[min(30vh,20rem)] h-[min(30vh,20rem)] flex-shrink-0 rounded-xl shadow-2xl drop-shadow-2xl"
                    style={{
                      backgroundImage: `url(${playlist?.albumImage.dataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="flex flex-col py-4">
                    <h1 className="album-title-name-shadow text-[min(4rem,max(8vh,2rem))] text-center  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {playlist?.name}
                    </h1>
                    <div>
                    <h1 className="text text-center opacity-70">
              artists here
            </h1>
                    </div>
                    
                  </div>
                  
                </div>
              </div>
            </div>
            
            
            
          </div>

          <div className="px-12 flex flex-col gap-y-2 mt-4">
            {
              playlist?.songs
                .map((song, index) => <AlbumSongTile key={index} song={song} trackNo={index + 1} playFunction={() => {playPlaylist(index)}} />)
            } 
            
          </div>
          <br />
          
        </div>
      </div>
    </div>
  )
}
