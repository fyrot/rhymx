import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import * as Dialog from "@radix-ui/react-dialog";

const PlaylistCarousel = () => {
  const [playlists, updatePlaylists] = useState([]);
  return (
    <div className="w-full p-4 rounded-xl bg-black bg-opacity-50 gap-y-2 flex flex-col">
      <h1 className="text-5xl font-semibold">Playlists</h1>
      <hr />
      <div className="flex flex-row py-4 flex-wrap">
        <div className="rounded-2xl p-4 flex flex-col ">
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="p-4 transition-all rounded-full bg-black bg-opacity-50 hover:bg-opacity-80 cursor-pointer" title="New Playlist">
              <Dialog.Root>
                <Dialog.Trigger>
                  <LuPlus className="text-4xl" />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="plugins-dialog-overlay" />
                  <Dialog.Content className="plugins-dialog-content">
                    <div className="w-3xl h-xl rounded-2xl">

                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              
            </div>
            
          </div>
          <div className="w-48 pt-2 flex flex-col items-center justify-center">
          </div>
        </div>
      </div>
    </div>
  )
}
export default PlaylistCarousel;