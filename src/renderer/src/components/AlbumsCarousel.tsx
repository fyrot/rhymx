import { Album } from "src/main/bgutils/songInformation"
import AlbumTile from "./AlbumTile"
const AlbumsCarousel = ( {albumList, title}: {albumList: Album[], title: string} ) => {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-semibold text-5xl">{title}</h1>
      <hr className="pt-1 h-0" />
      <div className="pt-1 flex flex-row snap-x snap-mandatory overflow-x-scroll">
        <>
        {albumList.map((albumI) => (
          <div className="snap-center">
            <AlbumTile album={albumI} />
          </div>
          
        ))}
        </>
      </div>
    </div>

  )
}
export default AlbumsCarousel