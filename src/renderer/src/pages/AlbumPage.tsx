import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router";

export default function AlbumPage() {
  const [abc, setAbc] = useSearchParams();
  useEffect(() => {
    console.log(abc.get("id"));
  }, [])
  return (
    <div>
      <div className="min-h-screen bg-slate-500">
        <NavigationBarSpacer accentGradient={true} />
        </div>   
    </div>
  )
}