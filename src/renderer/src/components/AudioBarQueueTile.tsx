import { AudioBarSong } from "src/main/bgutils/songInformation"
function timeToMMSS(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds - 60 * mm)
  return mm.toString() + ":" + (ss < 10 ? "0" + ss.toString() : ss.toString())
}
const AudioBarQueueTile = ({ song, highlight }: { song: AudioBarSong; highlight: boolean }) => {
  return (
    <div
      className={`bg-white ${highlight ? "bg-opacity-20" : "bg-opacity-0"} items-center hover:bg-opacity-10 transition-opacity flex flex-row p-3 gap-x-3`}
    >
      <div
        className="h-12 flex-shrink-0 w-12 rounded-xl"
        style={{
          backgroundImage: `url(${song.albumImage.dataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="grow flex items-center flex-row">
        <div className="flex flex-col">
          <h1 className="text-sm">{song.song.name}</h1>
          <h1 className="text-xs">{song.song.artists.join(", ")}</h1>
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
