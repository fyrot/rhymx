
import { LuPlus } from "react-icons/lu";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { queueToast } from "@renderer/helper/QueueToast";
const PlaylistNewTile = () => {
  const [open, updateOpen] = useState(false);
  const newPlaylistEntryName = "new_playlist_name";
  const createNewPlaylist = (event) => {
    event.preventDefault()
    console.log(event);
    const formData = new FormData(event.target);
    updateOpen(false);
    console.log(formData.entries());
    for (const entry of formData.entries()) {
      console.log(entry)
    }
    const playlistEntry = formData.entries().toArray()[0];
    const playlistName = playlistEntry[1].toString();
    //console.log(playlistName)
    if (playlistName.trim().length > 0) {
      window.electronAPI.libraryCreateNewPlaylist(playlistName);
      queueToast({title: playlistName, description: "new playlist created", background: "#121212"})
    } else {
      const titleMessage = "Invalid playlist title";
      queueToast({title: titleMessage, description: "please enter additional characters", background: "#aa0000"});
    }
    
  }
  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <Dialog.Root open={open} onOpenChange={updateOpen} >
        <Dialog.Trigger asChild>
          <span
            className="p-4 transition-all rounded-full bg-black bg-opacity-50 hover:bg-opacity-80 cursor-pointer"
            title="New Playlist"
          >
            <LuPlus className="text-4xl" />
          </span>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="plugins-dialog-overlay" />
          <Dialog.Content className="plugins-dialog-content shadow-lg">
            <div className="flex flex-col bg-neutral-800 p-6 gap-y-2 rounded-2xl">
              {/*<h1 className="font-semibold text-4xl">Create Playlist</h1>*/}
              <form onSubmit={createNewPlaylist} className="rounded-2xl flex gap-x-4 group flex-row items-center justify-center">
                <input
                  name={newPlaylistEntryName}
                  className="grow border-white group-focus-within:py-6 transition-all  bg-neutral-950 text-white rounded-2xl p-4"
                  placeholder="Playlist name"
                />
                <button type="submit"  className="rounded-2xl bg-opacity-50 hover:bg-opacity-100 p-4 group-focus-within:p-6  transition-all bg-neutral-950">
                  <span className="text-xl">
                    <LuPlus />
                  </span>
                </button>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default PlaylistNewTile;