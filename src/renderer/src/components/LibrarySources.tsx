import { useState } from "react"
import { LuListPlus, LuListX, LuPlus } from "react-icons/lu"
const LibrarySources = () => {
  const [testSources, updateTestSources] = useState([
  "C:/example/path/goes/here"
  ])
  return (
    <div className="w-full min-h-4 bg-neutral-800 rounded-2xl flex flex-col">
      <div className="p-4 flex flex-col gap-y-4">
        <div className="flex flex-row items-center gap-2">
          <h1 className="font-semibold inline-block text-xl">Sources</h1>
          <p className="text-sm font-extralight">
            
              the app will search under these sources for your music!
              {/* implement a help tooltip instead of this */}
            </p>
        </div>
        <hr className="accent-color-hr-hover-partial h-1 transition-all -mt-4 duration-200 hover:delay-300" />
        <div className="flex flex-col gap-y-2">
          <>
            {" "}
            {/* This is where each source would go */}
            {testSources.map((source) => (
              <div className="rounded-2xl  border-b-2 p-4 items-center bg-neutral-900 flex flex-row w-full">
                <h1>{source}</h1>
                <div className="grow" />
                <div
                  onClick={() => {
                    /* handle remove source */
                  }}
                  className="h-full rounded-2xl opacity-25 hover:opacity-100 transition-all duration-300 ease-out"
                >
                  <LuListX className="text-xl" />
                </div>
              </div>
            ))}
          </>
        </div>
        <div className="inline-block">
          <div className="border-white bg-transparent hover:bg-neutral-900 border-2 px-4 py-2 transition-all duration-300 ease-out items-center rounded-full flex-row inline-flex opacity-50 hover:opacity-100">
            <LuListPlus className="text-2xl" />
            <h1 className="pl-2 text-sm">Add Source</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LibrarySources
