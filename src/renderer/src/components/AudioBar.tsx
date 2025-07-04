import { useEffect, useRef, useState } from "react"
import {
  LuMicVocal,
  LuMusic3,
  LuPause,
  LuPlay,
  LuSkipBack,
  LuSkipForward,
  LuStretchHorizontal
} from "react-icons/lu"
import { useNavigate } from "react-router"
import { Song } from "src/main/bgutils/songInformation"
import { LRCData, LyricInfo } from "src/main/bgutils/LRCParserUtils"

const AudioBar = () => {
  const [songInformation, updateSongInformation] = useState<Song>()
  const [albumName, updateAlbumName] = useState<string>("")
  const navigate = useNavigate()

  const [currentImage, updateCurrentImage] = useState<string>("")
  const [playing, updatePlaying] = useState<boolean>(false)
  const [progressBarWidth, updateProgressBarWidth] = useState<string>("0%")
  const [progressBarTransitionDuration, updateProgressBarTransitionDuration] =
    useState<string>("10s")
  const [showCurrentlyPlayingScreen, updateShowCurrentlyPlayingScreen] = useState<boolean>(false)
  const [showQueueScreen, updateShowQueueScreen] = useState<boolean>(false)
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
      navigator.mediaSession.setActionHandler("pause", (action) => {
        toggleTrackPlaying()
      })
      navigator.mediaSession.setActionHandler("play", (action) => {
        toggleTrackPlaying()
      })
    }
    window.electronAPI.queueNotifyAudioBar(async () => {
      console.log("got notification")
      const newSong = await window.electronAPI.queueRetrieveCurrent()
      const newSongAlbumName = await window.electronAPI.libraryRetrieveAlbumNameById(
        newSong.albumRefId
      )
      const newImage = await window.electronAPI.libraryRetrieveAlbumImageById(newSong.albumRefId)

      if ("mediaSession" in navigator) {
        let trackDetails: any = {}
        trackDetails.title = newSong.name
        trackDetails.artist = newSong.artists.join(", ")
        navigator.mediaSession.metadata = new MediaMetadata(trackDetails)
      }

      updateAlbumName(newSongAlbumName)
      console.log(newSong)
      updateSongInformation(newSong)
      updateCurrentImage(newImage)
      updateProgressBar(0, true)
    })
  }, [])
  
  const navigateToAlbum = () => {
    console.log("navigating to album")
    setTimeout(() => {
      if (songInformation) {
        navigate(`/album?id=${songInformation.albumRefId}`)
        // clearly they're navigating for something
        updateShowCurrentlyPlayingScreen(false)
        updateShowQueueScreen(false)
      }
    }, 0)
  }
  const playTrack = () => {
    audioElement.current?.play()

    updateProgressBar(0, true)
  }
  const toggleTrackPlaying = () => {
    if (audioElement.current) {
      if (audioElement.current.paused) {
        audioElement.current.play()
        updateProgressBar(audioElement.current.currentTime, true)
      } else {
        audioElement.current.pause()
        updateProgressBar(audioElement.current.currentTime, false)
      }
      console.log("position", audioElement.current?.currentTime)
    }
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
  const updateProgressBar = (newPosition: number, startAnimation: boolean) => {
    if (progressBar.current && audioElement.current) {
      updateProgressBarWidth(((100 * newPosition) / audioElement.current.duration).toString() + "%")
      updateProgressBarTransitionDuration(newPosition.toString() + "s")
      if (startAnimation) {
        asynchronousUpdateProgressBar(newPosition)
      }
      // should really clean up those console.log()s that have been strewn around everywhere
    }
  }
  const asynchronousUpdateProgressBar = async (newPosition: number) => {
    setTimeout(() => {
      updateProgressBarWidth("100%")
      if (audioElement.current) {
        updateProgressBarTransitionDuration(
          (audioElement.current.duration - newPosition).toString() + "s"
        )
      }
    }, 100)
  }
  return (
    <div className={`fixed bottom-6 flex flex-col`}>
      <div
        className={`transition-all duration-150 self-center rounded-2xl mb-2 audio-bar-currently-playing-container-background w-[calc(100vw-3rem)] flex flex-row ${showCurrentlyPlayingScreen || showQueueScreen ? "h-[calc(100vh-3rem-4rem-3.5rem)] p-2" : "h-0 p-0"}`}
      >
        {" "}
        {/** "w-0 p-0" : "w-[calc(100vw-3rem)] p-2 py-3" */}
        <div
          className={`transition-all basis-0 duration-300 overflow-hidden min-w-0 ease-out ${showCurrentlyPlayingScreen ? "grow-[2]" : "w-0 grow-0"} flex`}
        >
          <div
            className="grow rounded-2xl w-full h-full shadow-2xl bg-clip-border drop-shadow-2xl flex"
            style={{
              background: "#ff0000"
            }}
          >
            <div className="audio-bar-currently-playing-image-blur rounded-2xl bg-clip-border grow flex flex-col items-center justify-center overflow-hidden">
              {/* This is where the lyrics display goes */}  
              {/* This is where the lyrics display ends */}
            </div>
          </div>
        </div>
        <div
          className={`transition-all basis-0 duration-300 ease-out flex flex-row min-w-0 overflow-clip ${showQueueScreen ? "grow" : "grow-0"}`}
        >
          {showCurrentlyPlayingScreen ? (
            <div
              className={`transition-all duration-300 flex-shrink ease-out ${showQueueScreen ? "grow-0" : "grow"}`}
            ></div>
          ) : (
            <div />
          )}

          <div
            className={`transition-all duration-300 overflow-clip ease-out flex flex-col ${showQueueScreen ? "grow" : "w-0 grow-0"}`}
          >
            <div className={`transition-all delay-500 duration-300 max-w-full overflow-clip`}>
              <p className="line-clamp-1 text-clip">queue goes here</p>
            </div>
          </div>
        </div>
      </div>

      {/* ^ this should be separated into its own component */}
      <div
        className={`audio-bar-container-background flex flex-col transition-all duration-[1000ms] ease-in-out ${songInformation === undefined ? "w-0 p-0" : "w-[calc(100vw-3rem)] p-3"} overflow-hidden mx-6 z-50 rounded-2xl`}
      >
        <div
          className={`transition-all duration-500 delay-[1000ms] ${songInformation === undefined ? "opacity-0 invisible" : "opacity-100 inline visible"}  flex flex-row items-center`}
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
            <h1 className=" font-semibold tracking-tight line-clamp-1">{songInformation?.name}</h1>
            <div className="flex flex-row gap-x-1">
              <h1 className="text-sm text-nowrap inline-block text-ellipsis items-center w-full line-clamp-1">
                <span className="opacity-70">{songInformation?.artists.join(", ")}</span>
                <span className="opacity-70">&nbsp;|&nbsp;</span>
                <span
                  className="transition-all duration-300 opacity-70 hover:opacity-100 delay-100 ease accent-color-text-hover-thin-underline"
                  onClick={navigateToAlbum}
                >
                  {albumName}
                </span>{" "}
                {/* <span className="text-xs">&#x25CF;</span> for a circle divider */}
              </h1>
            </div>
          </div>
          <audio
            ref={audioElement}
            onSeeked={() => {
              updateProgressBar(0, true)
            }}
            onEnded={trackEnded}
            onPlay={() => updatePlaying(true)}
            onPause={() => updatePlaying(false)}
            onCanPlay={() => {
              playTrack()
            }}
            autoPlay={false}
            className="bg-green-500"
            src={songInformation?.filePath}
          ></audio>
          <div className="grow" />
          <div className="flex flex-row">
            <div
              onClick={() => {
                updateShowCurrentlyPlayingScreen(!showCurrentlyPlayingScreen)
              }}
              className={`bg-transparent rounded-full hover:bg-red-500 p-4 transition-opacity self-center`}
            >
              <LuMicVocal
                className={`text-xl pointer-events-none text-white ${showCurrentlyPlayingScreen ? "opacity-100" : "opacity-50"}`}
              />
            </div>
            <div
              onClick={() => {
                updateShowQueueScreen(!showQueueScreen)
              }}
              className={`bg-transparent rounded-full hover:bg-red-500 p-4 transition-opacity`}
            >
              <LuStretchHorizontal
                className={`text-xl pointer-events-none text-white ${showQueueScreen ? "opacity-100" : "opacity-50"}`}
              />
            </div>
            <div
              onClick={skipBack}
              className="p-4 rounded-full duration-300 ease-out hover:bg-black"
            >
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
            <div
              ref={progressBar}
              className={`h-[max(2px,0.125rem)] audio-bar-progress-bar-accent ease-linear absolute bottom-0 left-0`}
              style={{
                transitionProperty: "width",
                transitionDuration: progressBarTransitionDuration,
                width: progressBarWidth
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AudioBar
