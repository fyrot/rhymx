import { useNavigate } from "react-router"
import { Playlist } from "src/main/bgutils/songInformation"

const PlaylistTile = ({ playlist }: { playlist: Playlist }) => {
  const navigate = useNavigate()
  const navigateToPlaylist = () => {
    navigate(`/playlist?id=${playlist.playlistId}`)
  }
  return (
    <div
      onClick={navigateToPlaylist}
      className="flex-col group inline-flex p-4 bg-transparent transition-all duration-300 rounded-2xl album-tile-fill-animation"
    >
      {playlist.albumImage.hasData ? (
        <div
          className="w-48 h-48 rounded-xl transition-all group-hover:w-52 group-hover:h-52"
          style={{
            backgroundImage: `url(${playlist.albumImage.dataUrl})`,
            backgroundSize: "cover"
          }}
        />
      ) : (
        <div className="w-48 h-48 rounded-xl transition-all group-hover:w-52 group-hover:h-52 bg-black flex items-center justify-center">
          <h1>{playlist.name.split(" ").map((word) => (word.at(0) ?? "")).join("")}</h1>
        </div>
      )}
      <div className="flex-col inline-flex pt-2 gap-1 w-48">
        <h1 className="text-sm line-clamp-2 text-ellipsis opacity-70 font-medium group-hover:opacity-100 transition-all duration-150">
          {playlist.name}
        </h1>
      </div>
    </div>
  )
}
export default PlaylistTile
