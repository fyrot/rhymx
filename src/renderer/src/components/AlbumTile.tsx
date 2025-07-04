import { useNavigate } from "react-router";
import { Album } from "src/main/bgutils/songInformation";

const AlbumTile = ( {album}:{album: Album}) => {
  const navigate = useNavigate();
  const navigateToAlbum = () => {
    console.log("abcoabc")
    
    navigate(`/album?id=${album.albumId}`);
  }
  return (
    <div onClick={navigateToAlbum} className="flex-col inline-flex p-4 bg-transparent transition-all duration-300 hover:bg-black hover:bg-opacity-30 rounded-2xl">
      <div className="w-48 h-48 rounded-xl" style={{backgroundImage: `url(${album.albumImage.dataUrl})`, backgroundSize: "cover"}} />
      <div className="flex-col inline-flex pt-2 w-48">
        <h1 className="text-sm line-clamp-2">{album.name}</h1>
        <p className="text-xs opacity-80 line-clamp-2 text-ellipsis overflow-hidden">{album.artists.join(", ")}</p>
    
      </div>
      </div>
  )
}
export default AlbumTile;