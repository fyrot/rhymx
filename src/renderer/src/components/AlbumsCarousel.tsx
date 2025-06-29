import { Album } from "src/main/bgutils/songInformation"
import AlbumTile from "./AlbumTile"
const AlbumsCarousel = ( {albumList, title}: {albumList: Album[], title: string} ) => {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-semibold text-2xl">{title}</h1>
      <hr className="pt-1 h-0" />
      <div className="pt-1">
        <>
        {albumList.map((albumI) => (
          <AlbumTile album={albumI} />
        ))}
        </>
      </div>
    </div>

  )
}
export default AlbumsCarousel