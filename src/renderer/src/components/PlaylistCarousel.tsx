import { useEffect, useState } from "react";
import PlaylistNewTile from "./PlaylistNewTile";
import { Playlist } from "src/main/bgutils/songInformation";
import PlaylistTile from "./PlaylistTile";
const PlaylistCarousel = () => {
  const [playlists, updatePlaylists] = useState<Playlist[]>([]);
  useEffect(() => {
    window.electronAPI.libraryRetrieveAllPlaylists().then((response) => {
      console.log(response)
      updatePlaylists(response);
    })
    window.electronAPI.libraryNotifyNewPlaylist(() => {
      console.log("notification received");
      window.electronAPI.libraryRetrieveAllPlaylists().then((response) => {
        console.log(response);
        console.log("notification received + updated");
        updatePlaylists(response);
      })
    })
  }, [])
  return (
    <div className="w-full p-4 rounded-xl bg-black bg-opacity-50 gap-y-2 flex flex-col">
      <div>
        <h1 className="text-5xl font-semibold accent-color-text-hover-partial-underline inline-block">Playlists</h1>
      </div>
      <div className="flex flex-row py-4 flex-wrap">
        {playlists.map((playlist) => (<PlaylistTile playlist={playlist} />))}
        <div className="rounded-2xl p-4 flex flex-col ">
          <PlaylistNewTile />
          {<div className="w-48 pt-2 flex flex-col items-center justify-center">
          </div>}
        </div>
      </div>
    </div>
  )
}
export default PlaylistCarousel;