import AlbumSongTile from "@renderer/components/AlbumSongTile"
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router"
import { Album } from "src/main/bgutils/songInformation"
export default function AlbumPage() {
  const [abc, setAbc] = useSearchParams()
  const [album, updateAlbum] = useState<Album>()
  useEffect(() => {
    console.log(abc.get("id"))
    // using ! operator here because it should be in there
    window.electronAPI
      .libraryRetrieveAlbumById(abc.get("id")!)
      .then((val) => {
        updateAlbum(val)
        console.log(val?.name)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])
  return (
    <div className="overflow-auto">
      <div className="fixed bottom-0 z-[8] album-page-more-content-fade h-[min(4rem,10vh)] w-full">
        {/* This is to add a gradient at the bottom of the viewport */}
      </div>
      <div>
        <div className="min-h-screen flex flex-col bg-neutral-700 ">
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
                    <h1 className="text-[min(4rem,max(10vh,2rem))] text-left  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {album?.name}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16">
              <h1 className="md:pl-[calc(2rem+min(40vh,20rem)+1rem)] text-xl leading-loose">
                {album?.artists.join(", ")}Blah
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
                    className="w-[min(40vh,20rem)] h-[min(40vh,20rem)] flex-shrink-0 rounded-xl shadow-2xl drop-shadow-2xl"
                    style={{
                      backgroundImage: `url(${album?.albumImage.dataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="flex flex-col-reverse pl-4 pt-8">
                    <h1 className="text-[min(4rem,max(8vh,2rem))] text-center  text-wrap overflow-hidden text-ellipsis font-semibold leading-[1.1] pb-1 tracking-tight drop-shadow-2xl inline-block">
                      {album?.name}
                    </h1>
                  </div>
                  <h1 className="text-xl py-2">
              {album?.artists.join(", ")}Blah
            </h1>
                </div>
              </div>
            </div>
            
            
            
          </div>

          <div className="px-12 flex flex-col gap-y-2 mt-4">
            {album?.discs.keys().toArray().length == 1 ? (
              album.discs
                .values()
                .toArray()[0]
                .map((song, index) => <AlbumSongTile song={song} trackNo={index + 1} />)
            ) : (
              <div></div>
            )}
          </div>

          <NavigationBarSpacer accentGradient={false} />
        </div>
      </div>
    </div>
  )
}
