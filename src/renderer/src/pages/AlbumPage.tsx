import AlbumSongTile from "@renderer/components/AlbumSongTile"
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useEffect, useState, useLayoutEffect } from "react"
import { LuDisc } from "react-icons/lu"
import { useParams, useSearchParams } from "react-router"
import { Album, Song, AudioBarSong } from "src/main/bgutils/songInformation"
export default function AlbumPage() {
  const [abc, setAbc] = useSearchParams()
  const [album, updateAlbum] = useState<Album>()
  useLayoutEffect(() => {
    // using ! operator here because it should be in there
    window.electronAPI
      .libraryRetrieveAlbumById(abc.get("id")!)
      .then((val) => {
        updateAlbum(val)
        console.log(val);
        console.log(val?.name)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [abc])

  const playAlbum = async (song:Song) => {
    const album = await window.electronAPI.libraryRetrieveAlbumById(song.albumRefId);
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
    console.log(song)
  }
  
  return (
    <div>
      <div>
        <div className="min-h-screen flex flex-col bg-neutral-800 ">
          <div className="hidden lg:inline">
            <div
              className="w-full relative inline-flex"
              style={{
                backgroundImage: `url(${album?.albumImage.dataUrl})`,
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
                      backgroundImage: `url(${album?.albumImage.dataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="flex flex-col-reverse pl-4 flex-">
                    <h1 className="album-title-name-shadow text-left text-[min(4rem,max(10vh,2rem))]  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {album?.name}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16">
              <h1 className="md:pl-[calc(2rem+min(40vh,20rem)+1rem)] opacity-70 text-left leading-loose text-nowrap text-ellipsis w-full overflow-x-hidden">
                {album?.artists.join(", ")}
              </h1>
            </div>
          </div>

          <div className="inline lg:hidden">
            <div
              className="w-full relative inline-flex "
              style={{
                backgroundImage: `url(${album?.albumImage.dataUrl})`,
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
                      backgroundImage: `url(${album?.albumImage.dataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="flex flex-col py-4">
                    <h1 className="album-title-name-shadow text-[min(4rem,max(8vh,2rem))] text-center  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {album?.name}
                    </h1>
                    <div>
                    <h1 className="text text-center opacity-70">
              {album?.artists.join(", ")}
            </h1>
                    </div>
                    
                  </div>
                  
                </div>
              </div>
            </div>
            
            
            
          </div>

          <div className="px-12 flex flex-col gap-y-2 mt-4">
            {album?.discs.size == 1 ? (
              album.discs
                .values()
                .toArray()[0]
                .map((song, index) => <AlbumSongTile key={index} song={song} trackNo={index + 1} playFunction={() => {playAlbum(song);}} />)
            ) : <></>
            } 
            {(album?.discs.size ?? 0) >= 2 ? album?.discs.entries().toArray().sort((a, b) => a[0].localeCompare(b[0])).map((value) => 
                <>
                
                <div className="flex items-center p-2 flex-row gap-x-2"><LuDisc /><span>{value[0]}</span> <hr className="grow" /> </div>
                {value[1].map((song, index) => <AlbumSongTile key={index} song={song} trackNo={index+1} playFunction={() => {playAlbum(song);}} />)}
                </>
            ) : <></>}  
          </div>
          <br />
          
        </div>
      </div>
    </div>
  )
}
