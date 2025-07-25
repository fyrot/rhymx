import { useEffect, useRef, useState, lazy } from "react"
import {
  LuPause,
  LuPlay,
  LuSkipBack,
  LuSkipForward,
  LuStretchHorizontal
} from "react-icons/lu"
import { useLocation, useNavigate } from "react-router"
import { AudioBarSong, Song } from "src/main/bgutils/songInformation"
import { LRCData } from "src/main/bgutils/LRCParserUtils"
import NavigationBarSpacer from "./NavigationBarSpacer"
import { FixedSizeList as ReactWindowList } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
const AudioBarQueueTile = lazy(() => import("./AudioBarQueueTile"))

function base64ToBlob(base64string:string) {
  const byteData = atob(base64string.split(",")[1]);
  const arrayBuffer= new Uint8Array(byteData.length);
  for (let i = 0; i < byteData.length; i++) {
    arrayBuffer[i] = byteData.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([arrayBuffer], {type: base64string.substring(0,base64string.indexOf(";")).substring("data:".length)}));
}

const AudioBar = () => {
  const [songInformation, updateSongInformation] = useState<Song>()

  const [currentQueueIndex, updateCurrentQueueIndex] = useState<number>(0);
  const [currentQueue, updateCurrentQueue] = useState<AudioBarSong[]>();
  const [currentImage, updateCurrentImage] = useState<string>("")
  const [currentLyrics, updateCurrentLyrics] = useState<LRCData>();

  const [albumName, updateAlbumName] = useState<string>("")

  const navigate = useNavigate()
  const location = useLocation();

  const [playing, updatePlaying] = useState<boolean>(false)
  const [progressBarWidth, updateProgressBarWidth] = useState<string>("0%")
  const [progressBarTransitionDuration, updateProgressBarTransitionDuration] =
    useState<string>("10s")
  const [showCurrentlyPlayingScreen, updateShowCurrentlyPlayingScreen] = useState<boolean>(false)

  const audioElement = useRef<HTMLAudioElement | null>(null)
  const audioContext = useRef<AudioContext | null>(null);
  const audioGain = useRef<GainNode | null>(null);
  const audioDynamicCompression = useRef<DynamicsCompressorNode | null>(null);

  const progressBar = useRef<HTMLDivElement>(null)
  const [currentTime, updateCurrentTime] = useState(0);

  const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  const lyricDisplayContainer = useRef<HTMLDivElement>(null);
  const lastLyricDisplayScroll = useRef<number>(Date.now())


  const [volume, updateVolume] = useState(0.8);

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
      const [newSong, queueIndex] = await window.electronAPI.queueRetrieveCurrent();
      if (!newSong) { return; }
      updateCurrentQueueIndex(queueIndex);
      updateAlbumName(newSong.albumName)
      updateSongInformation(newSong.song)
      updateCurrentImage(newSong.albumImage.dataUrl)
      //console.log(newSong)
      //console.log("got notification")

      //updateProgressBar(0, true);
    });
    window.electronAPI.queueNotifyAudioBarQueue(async (newQueue: AudioBarSong[]) => {
      if (!songInformation) {
        updateSongInformation(newQueue[0].song)
        updateCurrentQueueIndex(0);
        updateCurrentImage(newQueue[0].albumImage.dataUrl)
        updateAlbumName(newQueue[0].albumName)
        if ("mediaSession" in navigator) {
          let trackDetails: any = {}
          trackDetails.title = newQueue[0].song.name
          trackDetails.artist = newQueue[0].song.artists.join(", ")
          navigator.mediaSession.metadata = new MediaMetadata(trackDetails)
        }
      }
      updateCurrentQueue(newQueue);
    })

  }, [])
  useEffect(() => {
    updateShowCurrentlyPlayingScreen(false);
  }, [location])
  useEffect(() => {
    if (songInformation && songInformation.hasLRC) {
      window.electronAPI.queueRetrieveCurrentLRC(songInformation.filePath).then((newLRCData) => {
        updateCurrentLyrics(newLRCData);
        console.log(newLRCData);
      }).catch((error) => { console.log("wow") });

    } else {
      updateCurrentLyrics(undefined);
    }
    if (songInformation) {
      if ("mediaSession" in navigator) {
        let trackDetails: any = {}
        trackDetails.title = songInformation.name
        trackDetails.artist = songInformation.artists.join(", ")
        trackDetails.album = albumName;
        trackDetails.artwork = [{ src: base64ToBlob(currentImage) }];
        navigator.mediaSession.metadata = new MediaMetadata(trackDetails)
      }
    }
  }, [songInformation])
  // initializing audio context

  useEffect(() => {
    if (!audioContext.current) {
      audioContext.current = new window.AudioContext();
      audioGain.current = audioContext.current.createGain()
      audioDynamicCompression.current = audioContext.current.createDynamicsCompressor();

      /* dynamic compression set up  */

      audioDynamicCompression.current.attack.value = 0.02;
      audioDynamicCompression.current.knee.value = 30;
      audioDynamicCompression.current.release.value = 0.1;
      audioDynamicCompression.current.threshold.value = -30;
      audioDynamicCompression.current.ratio.value = 5;

    }
    if (audioElement.current && audioContext.current && audioGain.current && audioDynamicCompression.current) {
      try {
        /*const sourceNode = audioContext.current.createMediaElementSource(audioElement.current);
        sourceNode.connect(audioDynamicCompression.current);
        audioDynamicCompression.current.connect(audioGain.current);
        audioGain.current.connect(audioContext.current.destination);*/
      } catch (error) {
        console.log("error with source node creation", error);
      }
    }
    
    if (audioElement.current) {
      const eventLogging = (event) => {console.log(`Event ran, ${event.type}`); console.log(event)};
      const eventList = ['loadedmetadata', 'error', 'loadstart', 'abort', 'canplay'];
      eventList.forEach((e) => {audioElement.current?.addEventListener(e, eventLogging)})
      return () => {
        eventList.forEach((e) => {audioElement.current?.removeEventListener(e, eventLogging)})
      }
    } else {
      console.log("No audioElement.current");
    }
    
  }, [])

  useEffect(() => {
    const setupDebounce = (event: Event) => {
      console.log(event.isTrusted);
      if (event.isTrusted) {
        lastLyricDisplayScroll.current = Date.now()
      }
    }
    if (lyricDisplayContainer.current) {
      lyricDisplayContainer.current.addEventListener("wheel", setupDebounce);
    }
    return () => { lyricDisplayContainer.current?.removeEventListener("wheel", setupDebounce) }
  }, [])

  useEffect(() => {
    console.log("volume", volume);
    if (audioGain.current) {
      audioGain.current.gain.value = volume;
    }
  }, [volume])

  useEffect(() => {
    const audioTag = audioElement.current;
    if (!audioTag) { return }
    console.log("audio tag exists");
    const updateTimeEvent = () => {
      //console.log(audioTag.currentTime);
      updateCurrentTime(audioTag.currentTime);
    }
    audioTag.addEventListener("timeupdate", updateTimeEvent);
    return () => audioTag.removeEventListener("timeupdate", updateTimeEvent);
  }, [])

  useEffect(() => {
    window.electronAPI.currentlyPlayingUpdateVisibility(
      showCurrentlyPlayingScreen
    )
  }, [showCurrentlyPlayingScreen])
  const navigateToAlbum = () => {
    console.log("navigating to album")
    setTimeout(() => {
      if (songInformation) {
        navigate(`/album?id=${songInformation.albumRefId}`)
      }
    }, 0)
  }
  const navigateToArtist = (artist: string) => {
    console.log("navigating to artist");
    setTimeout(() => {
      navigate(`/artist?id=${artist.replaceAll(" ", "_")}`)
    }, 0)
  }
  const playTrack = () => {
    //audioElement.current?.play()

    //updateProgressBar(0, true)
  }
  const toggleTrackPlaying = () => {
    console.log(songInformation?.filePath);
    if (audioElement.current) {
      console.log(audioElement.current.src);
    }
    try {
      if (audioElement.current) {
        console.log(audioElement.current.src);
        if (audioElement.current.paused) {
          audioElement.current.play()

          //updateProgressBar(audioElement.current.currentTime, true)
        } else {
          audioElement.current.pause()
          //updateProgressBar(audioElement.current.currentTime, false)
        }
        console.log("position", audioElement.current?.currentTime)
      }
    } catch (e) {
      console.log(e);
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
      updateProgressBarTransitionDuration("0" + "s")
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
  const seekToPosition = (newPosition: number) => {
    if (!audioElement.current) { return; }
    updateProgressBar(newPosition, true);
    audioElement.current.currentTime = newPosition;
  }
  const lyricScrollDebounce = 3000;
  const navigateToLyric = (event: React.TransitionEvent<HTMLSpanElement>) => {
    const transitionElement = event.currentTarget;
    const shouldFill = transitionElement.classList.contains("audio-bar-filled-lyric");
    if (shouldFill && (Date.now() - lastLyricDisplayScroll.current) > lyricScrollDebounce) {
      transitionElement.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  const QueueRow = ({ index, style }) => {
    if (currentQueue !== undefined && currentQueue[index]) {
      const song = currentQueue[index];
      return (
        <div style={style}>
          <AudioBarQueueTile song={song} highlight={index == currentQueueIndex} index={index} />
        </div>
      )
    } else {
      return <></>
    }

  }
  return (
    <div className={`audio-bar-container flex  flex-col p-0`}>
      {/* gpu usage bottom 6 left 0 went crazy down using position absolute instead of fixed lol */}

      <div className={`transition-all flex bg-neutral-800 flex-col  ${showCurrentlyPlayingScreen ? "h-[calc(100vh-5rem-max(2px,.125rem))]" : "h-0"}`}>
        <NavigationBarSpacer accentGradient={false} />
        <div className="grow overflow-hidden flex-shrink flex px-4 pb-3 pt-0 flex-row">
          <div className={`grow-[2] basis-0 overflow-hidden flex min-w-0 rounded-2xl`} style={{ background: `url(${currentImage})`, backgroundSize: "100% 100%", backgroundPosition: "center", backgroundAttachment: "fixed", backgroundRepeat: "space" }}>
            <div ref={lyricDisplayContainer} className={`grow  rounded-2xl p-2 flex flex-col audio-bar-currently-playing-image-blur items-center overflow-y-auto ${!songInformation?.hasLRC ? "justify-center" : ""}`}>
              <br />
              {!songInformation?.hasLRC ? <div
                className={`w-[min(40vw,40vh,24rem)] h-[min(40vw,40vh,24rem)]  flex-shrink-0 rounded-xl shadow-2xl drop-shadow-2xl`}
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              /> : <></>}
              {currentLyrics?.lyrics.map(lyricBatch => (
                <div className="text-wrap text-center flex-shrink whitespace-break-spaces leading-snug font-semibold text-[min(10vh,2rem)]">
                  {lyricBatch.map(lyric =>
                    <span className="transition-all duration-150 ease-out opacity-100 hover:audio-bar-hover-lyric"><span onClick={() => seekToPosition(lyric.timestamp)} className={`${(currentTime + .15) > lyric.timestamp ? "audio-bar-filled-lyric" : "opacity-50"} transition-opacity duration-150 ease-out`} onTransitionEnd={navigateToLyric}>{lyric.line}</span></span>
                  )}
                  <br />
                </div>

              ))}

              <br />
            </div>

          </div>
          <span className={`p-2`}></span>
          {showCurrentlyPlayingScreen ?
            <div className={`grow rounded-2xl min-w-0 bg-neutral-900  overflow-hidden flex basis-0 flex-col p-4`}>
              <div className="flex flex-col grow">
                <h1 className="font-semibold">Queue</h1>
                <div className="mt-1 flex grow flex-col overflow-y-scroll">
                  { currentQueue?.map((absong, index) => (<><AudioBarQueueTile song={absong} index={index} highlight={currentQueueIndex == index} /><hr className="opacity-25" /></>))
                  }
                  {/*<AutoSizer>
                    {({ height, width }) => (
                      <ReactWindowList itemCount={currentQueue?.length ?? 0} height={height} width={width} itemSize={remSize * 4.5}>
                        {QueueRow}
                      </ReactWindowList>

                    )}

                  </AutoSizer>*/}


                </div>
              </div>
            </div> : <></>
          }

        </div>
      </div>

      {/* ^ this should be separated into its own component */}
      <div className="">
        <div
          ref={progressBar}
          className={`h-[max(2px,0.125rem)] audio-bar-progress-bar-accent ease-linear`}
          style={{
            transitionProperty: "width",
            transitionDuration: progressBarTransitionDuration,
            width: progressBarWidth
          }}
        ></div>
      </div>
      <div
        className={`audio-bar-container-background flex flex-col transition-all duration-[1000ms] ease-in-out ${songInformation === undefined ? "h-0 p-0" : "h-20 p-3"} overflow-hidden`}
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
          <div className="flex basis-1/2 flex-col pl-4">
            <h1 className="font-semibold tracking-tight line-clamp-1">{songInformation?.name}</h1>
            <div className="flex flex-row flex-shrink gap-x-1">
              <h1 className="text-sm text-nowrap text-ellipsis flex-shrink items-center w-full line-clamp-1">
                {songInformation?.artists.map((val, ind) => (
                  <>
                    <span onClick={() => { navigateToArtist(val) }} className="transition-all duration-300 opacity-70 hover:opacity-100 delay-100 ease accent-color-text-hover-thin-underline">
                      {val}
                    </span>
                    {ind < songInformation.artists.length - 1 ? <span className="opacity-70">, </span> : <></>}
                  </>
                ))}
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
              //updateProgressBar(0, true)
            }}
            onTimeUpdate={() => { }}
            onEnded={trackEnded}
            onPlay={() => { updatePlaying(true); updateProgressBar(audioElement.current?.currentTime ?? 0, true) }}
            onPause={() => { updatePlaying(false); updateProgressBar(audioElement.current?.currentTime ?? 0, false) }}
            onCanPlay={() => {
              playTrack()
            }}
            autoPlay={true}
            src={`${songInformation?.filePath}`}
          >
          </audio>
          <div className="grow" />
          <div className="flex flex-row flex-shrink-0 gap-x-2">

            <div
              onClick={() => {

                updateShowCurrentlyPlayingScreen(!showCurrentlyPlayingScreen)
              }}
              className={`bg-transparent rounded-full hover:bg-black p-4 transition-opacity`}
            >
              <LuStretchHorizontal
                className={`text-2xl pointer-events-none text-white ${showCurrentlyPlayingScreen ? "opacity-100" : "opacity-50"}`}
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
          </div>
        </div>
      </div>
    </div>
  )
}
export default AudioBar
