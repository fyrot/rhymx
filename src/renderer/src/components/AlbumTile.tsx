import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Album } from "src/main/bgutils/songInformation";

const AlbumTile = ( {album}:{album: Album}) => {
  const navigate = useNavigate();
  
  const [albumImage, updateAlbumImage] = useState<string>("");

  const navigateToAlbum = () => {
    console.log("abcoabc")
    
    navigate(`/album?id=${album.albumId}`);
  }
  
  useEffect(() => {
    window.electronAPI
      .libraryRetrieveAlbumImageById(album.albumId)
      .then((val) => {
        updateAlbumImage(val);
      })
  }, []);
  return (
    <div onClick={navigateToAlbum} className="flex-col group inline-flex p-4 bg-transparent transition-all duration-300 rounded-2xl album-tile-fill-animation">
      <div className="w-48 h-48 scale-100 transition-all group-hover:w-52 group-hover:h-52 rounded-xl" style={{backgroundImage: `url(${albumImage})`, backgroundSize: "cover"}} />
      <div className="flex-col inline-flex pt-2 gap-1 w-48">
        <h1 className="text-sm line-clamp-2 text-ellipsis opacity-70 font-medium group-hover:opacity-100 transition-all duration-150">{album.name}</h1>
        <p className="text-xs opacity-70 line-clamp-2 text-ellipsis overflow-hidden">{album.artists.join(", ")}</p>
    
      </div>
      </div>
  )
}
export default AlbumTile;