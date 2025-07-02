import { useEffect, useRef, useState } from "react"
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from "react-icons/lu";
import { Song } from "src/main/bgutils/songInformation"

const AudioBar = () => {
  const [songInformation, updateSongInformation] = useState<Song>();
  const [currentImage, updateCurrentImage] = useState<string>("");
  const [playing, updatePlaying] = useState<boolean>(false);
  const audioElement = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("nexttrack", (action) => {trackEnded();});
      navigator.mediaSession.setActionHandler("previoustrack", (action) => {skipBack();})
    }
    window.electronAPI.queueNotifyAudioBar(async () => {
    console.log("got notification")
    const newSong = await window.electronAPI.queueRetrieveCurrent()
    console.log(newSong)
    updateSongInformation(newSong)
    if ("mediaSession" in navigator) {
      let trackDetails:any = {}
      trackDetails.title = newSong.name;
      trackDetails.artist = newSong.artists.join(", ")
      navigator.mediaSession.metadata = new MediaMetadata(trackDetails);
      
    }
    const newImage = await window.electronAPI.libraryRetrieveAlbumImageById(newSong.albumRefId);
    //console.log(newImage, "woah");
    updateCurrentImage(newImage);
    //audioElement.current?.load();
    //audioElement.current?.play();
  })
  
  }, [])
  const playTrack = () => {
    
    audioElement.current?.play(); updatePlaying(true);
    
  }
  const toggleTrackPlaying = () => {
    if (audioElement.current?.paused) {
      audioElement.current.play();
    } else {
      audioElement.current?.pause();
    }
    console.log("position", audioElement.current?.currentTime);
  }
  const trackEnded = () => {
    window.electronAPI.queueNotifyTrackEnded();
  }
  const skipBack = () => {
    if (audioElement.current !== null) {
      if (audioElement.current.currentTime > 0.05 * audioElement.current.duration) {
        audioElement.current.currentTime = 0;  
      }
      window.electronAPI.queueNotifySkipTracks(-1);
    }
  }
  return (
    <div className={`audio-bar-container-background transition-all duration-1000 ease-in-out ${songInformation === undefined ? "w-0 p-0" : "w-[calc(100vw-3rem)] p-2"} overflow-hidden mx-6  z-50 fixed bottom-6 rounded-2xl`}>
      <div className={`transition-all duration-500 delay-1000 ${songInformation === undefined ? "opacity-0" : "opacity-100"} visible  flex flex-row items-center`}>
        <div  className="rounded-xl h-14 w-14"
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
        <audio ref={audioElement} onEnded={trackEnded} onPlay={() => updatePlaying(true)} onPause={() => updatePlaying(false)}  onCanPlay={() => {playTrack();}} className="bg-green-500" src={songInformation?.filePath}></audio>
        <div className="grow" />
        <div className="flex flex-row items-center">
          <div onClick={skipBack} className="p-4 rounded-full duration-300 ease-out hover:bg-black">
              <LuSkipBack className="text-2xl audio-bar-accent-icon" fill="#fff" />
          </div>
          <div  onClick={trackEnded} className="p-4 rounded-full duration-300 ease-out hover:bg-black">
            <LuSkipForward className="text-2xl audio-bar-accent-icon" fill="#fff" />
          </div>
          <div onClick={toggleTrackPlaying} className="p-4 rounded-full duration-300 ease-out hover:bg-black">
            {playing ? <LuPause className="text-2xl audio-bar-accent-icon" fill="#fff" /> : <LuPlay className="text-2xl" fill="#fff" />}
          </div>
          
        </div>
      </div>
    </div>
  )
}
export default AudioBar
