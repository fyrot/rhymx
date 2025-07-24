import { LuPause, LuPlay } from "react-icons/lu"
import { AudioBarSong } from "src/main/bgutils/songInformation"
function timeToMMSS(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds - 60 * mm)
  return mm.toString() + ":" + (ss < 10 ? "0" + ss.toString() : ss.toString())
}
const AudioBarQueueTile = ({ song, highlight, index }: { song: AudioBarSong; highlight: boolean, index: number }) => {
  //console.log(index)
  return (
    <div
      
      className={`bg-black  ${highlight ? "bg-opacity-50" : "bg-opacity-0"} items-center hover:bg-opacity-30 transition-all duration-300 flex flex-row p-3 gap-x-3`}
    >
      <div
        onClick={() => {window.electronAPI.queueUpdateQueueAndIndex(null, index);}}
        className="h-12  audio-bar-queue-item flex flex-shrink-0 w-12 items-center justify-center rounded-xl"
        style={{
          backgroundImage: `url(${song.albumImage.dataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
            
        </div>
      <div className="grow flex items-center pointer-events-none flex-row">
        <div className="flex flex-col">
          <h1 className="text-sm line-clamp-2">{song.song.name}</h1>
          <h1 className="text-xs line-clamp-1">{song.song.artists.join(", ")}</h1>
        </div>
        <div className="grow" />
        {/*<div>
          <span className="text-sm">{song.albumName}</span>
        </div>*/}
      </div>
      <div>
        <span>{timeToMMSS(song.song.duration)}</span>
      </div>
    </div>
  )
}
export default AudioBarQueueTile
