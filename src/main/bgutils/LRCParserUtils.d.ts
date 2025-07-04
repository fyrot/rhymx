export interface LyricInfo {
  timestamp: number,
  line: string,
  duration: number
}
export interface LRCData {
  metadata: {},
  lyrics: LyricInfo[][]
}