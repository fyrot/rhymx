import { useEffect, useState } from "react"
import { LuListPlus, LuListX, LuMicrochip } from "react-icons/lu"



const LibrarySources = () => {
  
  const [testSources, updateTestSources] = useState<string[]>([])

  useEffect(() => {
    window.electronAPI.libraryPrefRetrieveSourceList().then((response) => {
      console.log("Response should be received")
      console.log(response)
      updateTestSources(response);
      
    }).catch((error) => {console.log(error);})
  }, [])

  const addNewFolder = async () => {
    try {
      const response:string[] = await window.electronAPI.libraryPrefAddNewSource();
      const newSourcesList = [...testSources, ...response];
      updateTestSources(newSourcesList);
      window.electronAPI.libraryPrefUpdateSourceList(newSourcesList);
    } catch (error) {
      console.log(error);
    }
  }
  
  const removeFolder = (index: number) => {
    let modifiedSourcesList = [...testSources];
    modifiedSourcesList.splice(index, 1);
    console.log(modifiedSourcesList.toString() + " that's how it is modified");
    updateTestSources(modifiedSourcesList);
    window.electronAPI.libraryPrefUpdateSourceList(modifiedSourcesList);
  }

  return (
    <div className="w-full min-h-4 bg-neutral-800 rounded-2xl flex flex-col">
      <div className="p-4 flex flex-col gap-y-4">
        <div className="flex flex-row items-center gap-2">
          <h1 className="font-semibold pb-1 accent-color-text-hover-partial-underline inline-block text-2xl">Sources</h1>
          <p className="text-sm font-extralight">
            
              
              {/* implement a help tooltip instead of this */}
            </p>
        </div>
        {testSources.length == 0 ? <div className="w-full items-center justify-center"><p>Specify a folder for where your music is located</p></div> : <></>}
        <div className="flex flex-col gap-y-2 pr-4 accent-color-scrollbar transition-all duration-300">
          <>
            {" "}
            {/* This is where each source would go */}
            {testSources.map((source, index) => (
              <div className="rounded-2xl p-4 items-center bg-neutral-900 flex flex-row w-full library-pref-folder-fade-in-left">
                <h1 className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{source}</h1>
                <div className="grow" />
                <div
                  onClick={() => {removeFolder(index)}}
                  className="h-full rounded-2xl opacity-25 hover:opacity-100 transition-all duration-300 ease-out"
                >
                  <LuListX className="text-xl" />
                </div>
              </div>
            ))}
          </>
        </div>
        <div className="inline-block flex flex-row">
          <div onClick={addNewFolder} className="border-white bg-transparent hover:bg-neutral-900 border-2 px-4 py-2 transition-all duration-300 ease-out items-center rounded-full flex-row inline-flex opacity-50 hover:opacity-100">
            <LuListPlus className="text-2xl" />
            <h1 className="pl-2 text-sm">Add Source</h1>
          </div>
          <div onClick={() => {window.electronAPI.libraryPrefSourceIndex();}} className="border-white bg-transparent hover:bg-neutral-900 border-2 px-4 py-2 transition-all duration-300 ease-out items-center rounded-full flex-row inline-flex opacity-50 hover:opacity-100">
            <LuMicrochip className="text-2xl" />
            <h1 className="pl-2 text-sm">Test Index</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LibrarySources
