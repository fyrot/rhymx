import { useState } from "react"

const NavigationBar = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="w-full bg-transparent p-4 z-50 fixed">
            <button>Navigate now</button>
        </div>
    )
}
export default NavigationBar