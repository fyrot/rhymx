import AlbumTile from "@renderer/components/AlbumTile"
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useEffect, useState } from "react"
import { LuUser } from "react-icons/lu"
import { useSearchParams } from "react-router"
import { Album, Artist } from "src/main/bgutils/songInformation"

export default function ArtistPage() {
  const [searchParams, updateSearchParams] = useSearchParams()
  const [artist, updateArtist] = useState<Artist>()
  const [discographyIds, updateDiscographyIds] = useState<string[]>([]);
  const [discography, updateDiscography] = useState<Album[]>([]);
  useEffect(() => {
    updateDiscographyIds([]);
    updateDiscography([]);
    window.electronAPI
      .libraryRetrieveArtistById(searchParams.get("id") ?? "")
      .then((val) => {
        if (val) {
          updateArtist(val)
          updateDiscographyIds(val.discography);
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [searchParams])
  useEffect(() => {
    
    discographyIds.forEach((id) => {
      window.electronAPI.libraryRetrieveAlbumById(id).then((album) => {
        if (album) {
          updateDiscography([...discography, album])
        }
      }).catch((err) => {console.log(err);})  
    })
  }, [discographyIds])
  return (
    <div className="min-h-screen flex flex-col bg-neutral-800 ">
      <div className="hidden lg:inline">
        <div
          className="w-full relative inline-flex"
          
        >
          <div className="grow album-image-parallax-bar flex flex-col">
            <NavigationBarSpacer accentGradient={false} />
            <div className="w-full flex flex-row px-8">
              <div
                className="md:w-[min(30vh,20rem)] md:h-[min(30vh,20rem)] flex-shrink-0 rounded-full shadow-md drop-shadow-sm flex justify-center items-center bg-black bg-opacity-50 -mb-16">
                  <LuUser className="text-7xl" />
                </div>
              <div className="flex flex-col-reverse py-2 pl-4">
                <h1 className="text-6xl font-semibold">{artist?.name}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="h-16">
        </div>
      </div>

      <div className="inline lg:hidden">
        <div
          className="w-full relative inline-flex "
          
        >
          <div className="grow album-image-parallax-bar flex flex-col">
            <NavigationBarSpacer accentGradient={false} />
            <div className="w-full flex flex-col items-center px-8 pt-2">
              <div
                className="w-[min(30vh,20rem)] h-[min(30vh,20rem)] flex-shrink-0 rounded-full flex justify-center bg-black bg-opacity-50 items-center drop-shadow-sm"
                >
                  <LuUser className="text-7xl" />
                </div>
              <div className="flex flex-col py-4">
                <h1 className="text-4xl font-semibold">
                  {artist?.name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-8 py-2 flex flex-wrap gap-x-4">
        {
          discography.map((album) => (
            <AlbumTile album={album} />
          ))
        }
      </div>
    </div>
  )
}
