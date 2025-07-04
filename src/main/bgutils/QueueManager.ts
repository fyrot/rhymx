import { readFile, readFileSync } from "fs";
import { parseLRC } from "./LRCParser";
import { LRCData } from "./LRCParserUtils";
import { Song } from "./songInformation";
import { join, parse } from "path";

export class QueueManager {
  queueList: Song[];
  queueIndex: number;
  dummySong = <Song>{
    name: "Error",
    albumRefId: "none",
    artists: ["fyrot"],
    filePath: "https://www.youtube.com/watch?v=CQeezCdF4mk",
    songId: "none",
    trackNo: -1
  }
  // perhaps implement preferences for playback [loop, shuffle, autoplay(?)] here
  constructor(queueData?:Song[], queueIndex?:number) {
    this.queueList = queueData ?? []; // undefined check
    this.queueIndex = queueIndex ?? (this.queueList.length > 0 ? 0 : -1);
  }
  updateQueue(newQueue:Song[]):void {
    this.queueList = newQueue;
    this.queueIndex = 0;
  }
  updateIndex(newIndex:number):void {
    this.queueIndex = (newIndex < this.queueList.length && newIndex > -1 ? newIndex : 0);
  }
  addToQueue(...newSongs:Song[]):void {
    this.queueList.push(...newSongs);
  }
  retrieveCurrent():Song {
    try {
      return this.queueList[this.queueIndex];
    } catch (error) {
      console.log("The queue index is not synced with the queue -- someone wrote bad code");
      return this.dummySong;
    }
  }
  retrieveCurrentLRC(filePath:string):LRCData {
    let lrcPath = filePath;
    if (!filePath.endsWith(".lrc")) {
      const parsedPath = parse(filePath);
      lrcPath = join(parsedPath.dir, parsedPath.name) + ".lrc";
    
    }
    return parseLRC(readFileSync(lrcPath).toString());
  }
  trackEnded():void {
    this.goToNextTrack();
  }
  goToNextTrack():void {
    this.queueIndex = Math.min(this.queueIndex + 1, this.queueList.length-1);
  }
  skipTracks(tracksSkipped:number):void {
    this.queueIndex = Math.max(0, Math.min(this.queueIndex+tracksSkipped, this.queueList.length-1))
  }
  
}