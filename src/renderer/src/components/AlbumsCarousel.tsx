import { Album } from "src/main/bgutils/songInformation"
import AlbumTile from "./AlbumTile"
import { useEffect, useRef, useState } from "react"
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
const AlbumsCarousel = ( {albumList, title, id}: {albumList: Album[], title: string, id:string} ) => {
  const carouselComponent = useRef<HTMLDivElement>(null);
  const scrollWidthRem = 12;
  const computedScrollWidth = scrollWidthRem*parseFloat(getComputedStyle(document.documentElement).fontSize);
  const [opened, updateOpened] = useState<boolean>(false);
  const horizontalScroll = (event:WheelEvent) => {
    event.preventDefault();
    
    if (carouselComponent.current) {
      const clampedValue = Math.max(-1, Math.min(1, event.deltaY));
      carouselComponent.current.scrollLeft += (clampedValue*computedScrollWidth);
      console.log(clampedValue*computedScrollWidth);
    }

  }
  useEffect(() => {
    if (carouselComponent.current) {
      carouselComponent.current.addEventListener(("wheel"), horizontalScroll, {passive: false}); 
      return () => {carouselComponent.current?.removeEventListener("wheel", horizontalScroll)}
    }
    
  }, [])
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        <div onClick={() => {updateOpened(!opened);}} className="py-2 px-4 transition-all bg-[rgba(0,0,0,0.5)] hover:bg-[rgba(0,0,0,0.75)] text-white text-opacity-50 hover:text-opacity-100 rounded-full my-2">
          {opened ? <LuChevronUp /> : <LuChevronDown />}
        </div>
        <h1 className="font-semibold ml-2 text-5xl">{title}</h1>
        <div className="grow" />
        
      </div>  
      <div ref={carouselComponent} className={`py-1 bg-[rgba(0,0,0,0.5)] rounded-xl snap-x scroll-smooth snap-proximity ${opened ? "flex-wrap flex-row" : "overflow-x-auto"} flex flex-row accent-color-scrollbar-less-intrusive`}>
        <>
        {albumList.map((albumI) => (
          <div key={albumI.albumId} className="snap-start">
            <AlbumTile album={albumI} />
          </div>
          
        ))}
        </>
      </div>
    </div>

  )
}
export default AlbumsCarousel