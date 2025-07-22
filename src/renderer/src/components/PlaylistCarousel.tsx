import { LuPlus } from "react-icons/lu";

const PlaylistCarousel = () => {
  return (
    <div className="w-full p-4 rounded-xl bg-black bg-opacity-50 gap-y-2 flex flex-col">
      <h1 className="text-5xl font-semibold">Playlists</h1>
      <hr />
      <div className="flex flex-row py-4 flex-wrap">
        <div className="rounded-2xl p-4 flex flex-col ">
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="p-4 transition-all rounded-full bg-black bg-opacity-50 hover:bg-opacity-80 cursor-pointer" title="New Playlist">
              <LuPlus className="text-4xl" />
            </div>
            
          </div>
          <div className="w-48 pt-2 flex flex-col items-center justify-center">
          </div>
        </div>
      </div>
    </div>
  )
}
export default PlaylistCarousel;