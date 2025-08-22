import AlbumsCarousel from "@renderer/components/AlbumsCarousel";
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer";
import { useEffect, useState } from "react";
import { Album } from "src/main/bgutils/songInformation";
export default function LibraryPage() {
  const [allAlbumsCarouselContent, updateAllAlbumsCarouselContent] = useState<Album[]>([]);
  useEffect(() => {
    let allAlbumData:Album[];
    window.electronAPI.libraryRetrieveAllAlbums().then((value) => {
      allAlbumData = value;
      updateAllAlbumsCarouselContent(value);
      console.log(value)
    }).catch((error) => {console.log(error);})
  }, []);
  return (
    <div>
      <div className="min-h-screen bg-neutral-800 flex flex-col items-center justify-center">
        <NavigationBarSpacer accentGradient={false} />
        <div className="grow flex flex-col w-full items-center">
          <div className="p-4 pt-0 w-full">
            {/*<h1>this is where the entire library can be accessed</h1>*/}
            <AlbumsCarousel id="example" albumList={allAlbumsCarouselContent.sort((a,b) => a.name.localeCompare(b.name))} title={"All Albums"} />
      
          </div>
          
        </div>
        </div>
    </div>
  )
}