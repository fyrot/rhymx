import { Album } from "src/main/bgutils/songInformation";

const AlbumTile = ( {album}:{album: Album}) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="w-48 h-48 bg-white">

      </div>
      <h1 className="text-sm font-light">{album.name}</h1>
      <p>{album.artists.join(", ")}</p>
    </div>
  )
}
export default AlbumTile;