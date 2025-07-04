import { Song } from "src/main/bgutils/songInformation"
import { LuEllipsisVertical, LuPlay } from "react-icons/lu"
function timeToMMSS(seconds: number):string {
  const mm = Math.floor(seconds/60);
  const ss = Math.round(seconds-(60*mm));
  return mm.toString() + ":" + (ss < 10 ? "0" + ss.toString() : ss.toString());
}
const AlbumSongTile = ({ song, trackNo, albumQueue}: { song: Song; trackNo: number, albumQueue:Song[] }) => {
  const playSong = () => {
    window.electronAPI.queueUpdateQueueAndIndex(albumQueue, trackNo-1);
    console.log(song)
  }
  return (
    <div className={`items-center w-full p-1 rounded-xl hover:drop-shadow-xl hover:shadow-xl album-song-tile-styles`}>
      <div className="flex album-song-tile-row-container flex-row gap-x-4 items-center">
        <div
          onClick={playSong}
          className="album-numplay-click-container flex p-2  rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-black hover:bg-opacity-50 "
        >
          <div className="flex grow items-center album-numplay-container w-8 h-8 justify-center">
            <h1 className="album-numplay-num-hide-on-tile-hover font-bold">{trackNo}</h1>
            <LuPlay className="album-numplay-play-show-on-tile-hover text-xl" />
          </div>
        </div>

        <div className="hidden grow flex-row lg:flex">
          <h1 className="leading-5 basis-1/2 grow line-clamp-1 font-semibold tracking-tight">{song.name}</h1>
          <h1 className="leading-5 basis-1/2 grow font-light text-sm">{song.artists.join(", ")}</h1>
          
        </div>

        <div className="inline-flex grow flex-row lg:hidden">
          
            <div className="flex flex-col">
            <h1 className="leading-5 line-clamp-1 font-semibold">{song.name}</h1>
            <h1 className="leading-5 text-sm">{song.artists.join(", ")}</h1>
          </div>
          <div className="grow" />
          
        </div>

        <div>
          <h1>{timeToMMSS(song.duration)}</h1>
        </div>
        <div className="album-ell-hide-on-tile-hover">
          <LuEllipsisVertical className="text-xl" />
        </div>
        <div />
      </div>
    </div>
  )
}
export default AlbumSongTile
