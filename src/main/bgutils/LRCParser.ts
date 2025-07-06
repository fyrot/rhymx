import { LyricInfo, LRCData } from "./LRCParserUtils";
//const nativeEndOfLine = typeof window === "undefined" ? require("os").EOL : "\n"
// if not in a browser context, use node operating system to check character to split a line on
function parseTimeBrackets(data: string) {
  // takes in an input like [0x:xx.xx] and returns a timestamp in seconds 
  const mmss:number[] = data.trim().slice(1, -1).split(":").map(val => parseFloat(val.trim()));
  // assumes an array of length 2
  console.log(data.trim().slice(1,-1));
  return (mmss[0] * 60) + mmss[1];
}
function parseMetadataBrackets(data:string) {
  //console.log("metadata", data);
  const tagInformation:string[] = data.trim().slice(1, -1).split(":").map(val => val.trim());
  return {tagName: tagInformation[0], tagData: tagInformation.slice(1).join(":")}
}
const lineEndingRE = /\r?\n|\r/
const metadataRE = /\[\D*:.*\]/ 
const timeRE = /[\[<]\d\d:\d\d.\d\d[\]>]/
const timeGlobalRE = /[\[<]\d\d:\d\d.\d\d[\]>]/g

export function parseLRC(textFile: string) {
  const parsed:LRCData = {
    metadata: {},
    lyrics: []
  };
  const lines = textFile.split(lineEndingRE);
  //console.log("lines", lines.length)
  const metadataLines = lines.filter(line => metadataRE.test(line));
  for (const metadataLine of metadataLines) {
    const parsedMetadata = parseMetadataBrackets(metadataLine);
    parsed.metadata[parsedMetadata.tagName] = parsedMetadata.tagData;
  }
  const lyrics = lines.filter(line => timeRE.test(line));
  let preprocessedLyrics:LyricInfo[][] = [];
  
  lyrics.forEach((lyric) => {
    let section:LyricInfo[] = [];
    console.log(lyric);
    let tempArr:RegExpExecArray|null;
    while (tempArr = timeGlobalRE.exec(lyric)) {

      section.push(<LyricInfo>{
        timestamp: parseTimeBrackets(tempArr[0]),
        line: tempArr.input.slice(tempArr[0].length),
        duration: 0
      })

    }
    preprocessedLyrics.push(section);
  })
  //console.log(preprocessedLyrics[0]);
  //process durations
  preprocessedLyrics.forEach((lyricBatch, lyricBatchIndex) => {
    for (let lyricIndex = 0; lyricIndex < lyricBatch.length-1; lyricIndex++) {
      const currentTimestamp = preprocessedLyrics[lyricBatchIndex][lyricIndex].timestamp;
      const nextTimestamp = preprocessedLyrics[lyricBatchIndex][lyricIndex+1].timestamp;
      preprocessedLyrics[lyricBatchIndex][lyricIndex].duration = nextTimestamp - currentTimestamp;
    }
    if (lyricBatchIndex < preprocessedLyrics.length-1 && preprocessedLyrics[lyricBatchIndex+1].length>0) {
      const lastIndex = preprocessedLyrics[lyricBatchIndex].length-1;
      const currentTimestamp = preprocessedLyrics[lyricBatchIndex][lastIndex].timestamp;
      const nextTimestamp = preprocessedLyrics[lyricBatchIndex+1][0].timestamp;
      preprocessedLyrics[lyricBatchIndex][lastIndex].duration = nextTimestamp-currentTimestamp;
    }
  })
  parsed.lyrics = preprocessedLyrics;
  return parsed;
}