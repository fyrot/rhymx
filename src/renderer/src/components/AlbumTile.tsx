import { Album } from "src/main/bgutils/songInformation";

const AlbumTile = ( {album}:{album: Album}) => {
  return (
    <div className="flex-col inline-flex p-4 bg-transparent transition-all duration-300 hover:bg-slate-600 rounded-2xl">
      <div className="w-48 h-48 rounded-xl" style={{backgroundImage: `url(${album.albumImage.dataUrl})`, backgroundSize: "cover"}} />
      <div className="flex-col inline-flex pt-2 w-48">
        <h1 className="">{album.name}</h1>
        <p className="text-sm text-ellipsis overflow-hidden">{album.artists.join(", ")}</p>
    
      </div>
      </div>
  )
}
export default AlbumTile;