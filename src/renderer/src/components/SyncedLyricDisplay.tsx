import { useEffect, useMemo, useState } from "react"
import { LRCData, LyricInfo } from "src/main/bgutils/LRCParserUtils"
import { Song } from "src/main/bgutils/songInformation"

const LyricLine = ({lyric, time}:{lyric:LyricInfo, time:number} ) => {
  const opacityVal = (time >= lyric.timestamp) ? "1" : "0.8"
  return <span style={{opacity: opacityVal}}>{lyric.line}</span>
}

const LyricsList = ({lyrics, newTime}:{lyrics:LyricInfo[][], newTime:number}) => {
  const rendered = useMemo(() => {
    return lyrics.map((lyricBatch, index) => {
      
      return <>
      {lyricBatch.map((lyric) => {
        <LyricLine lyric={lyric} key={lyric.timestamp} time={newTime} />
      })}
        
      </>
      
    })
  }, [lyrics, newTime]);
  return <div>{rendered}</div>
}

const SyncedLyricDisplay = ({song}:{song:Song}) => {
  const [currentLyrics, updateCurrentLyrics] = useState<LRCData>()
  const [currentTime, updateCurrentTime] = useState<number>(0);
  useEffect(() => {
    if (song !== undefined && song.hasLRC) {
      window.electronAPI
        .queueRetrieveCurrentLRC(song.path)
        .then((lrcData) => {
          updateCurrentLyrics(lrcData)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [song])
  useEffect(() => {
    const timeTick = setInterval(() => {
      updateCurrentTime(currentTime+0.3);
    }, 300)
    return () => {clearInterval(timeTick)}
  })
  return (
    <LyricsList lyrics={currentLyrics?.lyrics ?? []} newTime={currentTime} />
  )
}
