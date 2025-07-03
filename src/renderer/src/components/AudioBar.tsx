import { useEffect, useRef, useState } from "react"
import { LuMusic3, LuPause, LuPlay, LuSkipBack, LuSkipForward, LuStretchHorizontal } from "react-icons/lu"
import { Song } from "src/main/bgutils/songInformation"

const AudioBar = () => {
  const [songInformation, updateSongInformation] = useState<Song>()
  const [currentImage, updateCurrentImage] = useState<string>("")
  const [playing, updatePlaying] = useState<boolean>(false)
  const [progressBarWidth, updateProgressBarWidth] = useState<string>("0%")
  const [progressBarTransitionDuration, updateProgressBarTransitionDuration] = useState<string>("10s")
  
  const [showCurrentlyPlayingScreen, updateShowCurrentlyPlayingScreen] = useState<boolean>(false);
  const [showQueueScreen, updateShowQueueScreen] = useState<boolean>(false);
  const audioElement = useRef<HTMLAudioElement>(null)
  const progressBar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("nexttrack", (action) => {
        trackEnded()
      })
      navigator.mediaSession.setActionHandler("previoustrack", (action) => {
        skipBack()
      })
      navigator.mediaSession.setActionHandler("seekto", (action) => {
        testSeek()
      })
    }
    window.electronAPI.queueNotifyAudioBar(async () => {
      console.log("got notification")
      const newSong = await window.electronAPI.queueRetrieveCurrent()
      console.log(newSong)
      updateSongInformation(newSong)
      if ("mediaSession" in navigator) {
        let trackDetails: any = {}
        trackDetails.title = newSong.name
        trackDetails.artist = newSong.artists.join(", ")
        navigator.mediaSession.metadata = new MediaMetadata(trackDetails)
      }
      const newImage = await window.electronAPI.libraryRetrieveAlbumImageById(newSong.albumRefId)
      //console.log(newImage, "woah");
      updateCurrentImage(newImage)
      //audioElement.current?.load();
      //audioElement.current?.play();
    })
  }, [])
  const playTrack = () => {
    audioElement.current?.play()
    updatePlaying(true);
    updateProgressBar(0);
  }
  const toggleTrackPlaying = () => {
    if (audioElement.current?.paused) {
      audioElement.current.play()
    } else {
      audioElement.current?.pause()
    }
    console.log("position", audioElement.current?.currentTime)
  }
  const trackEnded = () => {
    window.electronAPI.queueNotifyTrackEnded()
  }
  const skipBack = () => {
    if (audioElement.current !== null) {
      if (audioElement.current.currentTime > 0.05 * audioElement.current.duration) {
        audioElement.current.currentTime = 0
      }
      window.electronAPI.queueNotifySkipTracks(-1)
    }
  }
  const testSeek = () => {
    console.log("woah")
  }
  const updateProgressBar = (newPosition: number) => {
    if (progressBar.current && audioElement.current) {
      updateProgressBarWidth((100 * newPosition / audioElement.current.duration).toString() + "%");
      updateProgressBarTransitionDuration("0s");
      asynchronousUpdate(newPosition)
      // should really clean up those console.log()s that have been strewn around everywhere
    }
  }
  const asynchronousUpdate = async (newPosition: number) => {
    setTimeout(() => {
      updateProgressBarWidth("100%")
      if (audioElement.current) {
        updateProgressBarTransitionDuration((audioElement.current.duration - newPosition).toString()+"s");
      }
    }, 300);
  }
  return (
    <div className="fixed bottom-6 flex flex-col items-center">
      <div className={`transition-all rounded-2xl mb-4 bg-red-500 w-[calc(100vw-3rem)] flex flex-row ${showCurrentlyPlayingScreen || showQueueScreen ? "h-16 p-2" : "h-0 p-0"}`}> {/** "w-0 p-0" : "w-[calc(100vw-3rem)] p-2 py-3" */}
        <div className={`transition-all delay-150 bg-blue-500 duration-300 ease-out ${showCurrentlyPlayingScreen ? "grow" : "grow-0"}`}>

        </div>
        <div className={`transition-all delay-150 bg-green-500 duration-300 ease-out ${showQueueScreen ? "grow" : "grow-0"}`}>

        </div>
      </div>
      <div
      className={`audio-bar-container-background flex flex-col transition-all duration-1000 ease-in-out ${songInformation === undefined ? "w-0 p-0" : "w-[calc(100vw-3rem)] p-2 py-3"} overflow-hidden mx-6  z-50 rounded-2xl`}
    >
      <div
        className={`transition-all duration-500 delay-1000 ${songInformation === undefined ? "opacity-0" : "opacity-100"} visible  flex flex-row items-center`}
      >
        <div
          className="rounded-xl h-14 w-14"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className="flex flex-col pl-4">
          <h1 className=" font-semibold tracking-tight">{songInformation?.name}</h1>
          <div className="flex flex-row gap-x-1">
            <h1 className="text-sm text-nowrap overflow-x-hidden inline-block text-ellipsis">
              {songInformation?.artists.join(", ")}
            </h1>
          </div>
        </div>
        <audio
          ref={audioElement}
          onSeeked={() => {
            updateProgressBar(0)
          }}
          onEnded={trackEnded}
          onPlay={() => updatePlaying(true)}
          onPause={() => updatePlaying(false)}
          onCanPlay={() => {
            playTrack();
            updateProgressBar(0)
          }}
          className="bg-green-500"
          src={songInformation?.filePath}
        ></audio>
        <div className="grow" />
        <div className="flex flex-row">
          <div onClick={() => {updateShowCurrentlyPlayingScreen(!showCurrentlyPlayingScreen);}} className={`bg-transparent hover:bg-red-500 p-4 transition-opacity self-center`}>
            <LuMusic3 className={`text-xl pointer-events-none text-white ${showCurrentlyPlayingScreen ? "opacity-100" : "opacity-50"}`} /> 
          </div>
          <div onClick={() => {updateShowQueueScreen(!showQueueScreen);}} className={`bg-transparent hover:bg-red-500 p-4 transition-opacity`}>
            <LuStretchHorizontal className={`text-xl pointer-events-none text-white ${showQueueScreen ? "opacity-100" : "opacity-50"}`} /> 
          </div>
          <div onClick={skipBack} className="p-4 rounded-full duration-300 ease-out hover:bg-black">
            <LuSkipBack className="text-2xl audio-bar-accent-icon" fill="#fff" />
          </div>
          <div
            onClick={trackEnded}
            className="p-4 rounded-full duration-300 ease-out hover:bg-black"
          >
            <LuSkipForward className="text-2xl audio-bar-accent-icon" fill="#fff" />
          </div>
          <div
            onClick={toggleTrackPlaying}
            className="p-4 rounded-full duration-300 ease-out hover:bg-black"
          >
            {playing ? (
              <LuPause className="text-2xl audio-bar-accent-icon" fill="#fff" />
            ) : (
              <LuPlay className="text-2xl" fill="#fff" />
            )}
          </div>
        </div>
      </div>
      <div
        ref={progressBar}
        className={`h-[max(2px,0.125rem)] ease-linear absolute bg-white bottom-0 left-0`}
        style={{
          transitionProperty: "all",
          transitionDuration: progressBarTransitionDuration,
          width: progressBarWidth
        }}
      ></div>
    </div>
    </div>
    
  )
}
export default AudioBar
