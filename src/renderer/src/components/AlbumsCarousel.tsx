import { Album } from "src/main/bgutils/songInformation"
import AlbumTile from "./AlbumTile"
import { useEffect, useRef, useState } from "react"
const AlbumsCarousel = ( {albumList, title, id}: {albumList: Album[], title: string, id:string} ) => {
  const carouselComponent = useRef<HTMLDivElement>(null);
  const scrollWidthRem = 12;
  const computedScrollWidth = scrollWidthRem*parseFloat(getComputedStyle(document.documentElement).fontSize);
  
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
      <h1 className="font-semibold text-5xl">{title}</h1>
      <hr className="pt-1 h-0" />
      <div ref={carouselComponent} className="py-1  pb-2 snap-x scroll-smooth snap-proximity flex flex-row overflow-x-scroll accent-color-scrollbar-less-intrusive">
        <>
        {albumList.map((albumI) => (
          <div className="snap-start">
            <AlbumTile album={albumI} />
          </div>
          
        ))}
        </>
      </div>
    </div>

  )
}
export default AlbumsCarousel