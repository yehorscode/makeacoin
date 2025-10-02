import { BadgePlus, Sun, Moon, User, Compass } from "lucide-react"
import { Outlet } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"

export default function Layout() {
    const { theme, setTheme } = useTheme()
    const path = window.location.pathname
    function switchTheme() {
        if (theme === "dark") {
            setTheme("light")
        }
        else {
            setTheme("dark")
        }
    }
    return (
        <div className="">
            <div className="transition-all fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-accent gap-5 border rounded-full p-4 pl-10 pr-10 flex items-center justify-center z-10">
                <button className="hover:animate-spin duration-200  hover:scale-120 transition-all hover:cursor-pointer" style={{transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275)"}}>
                    <Compass size={35}/>
                </button>
                <BadgePlus size={35} className="hover:animate-spin hover:scale-120 transition-all hover:cursor-pointer" style={{transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275)"}}/>
                <button onClick={() => switchTheme()} className="hover:animate-in hover:scale-120 transition-all hover:cursor-pointer" style={{transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275)"}}>
                    {theme === "light" ? <Moon size={35}/> : <Sun size={35}/>}
                </button>
                <button className="hover:animate-bounce duration-200 hover:scale-120 transition-all hover:cursor-pointer" style={{transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275)"}}>
                    <User size={35}/>
                </button>
                <span className="font-mono opacity-50">{path}</span>
            </div>
            <Outlet />
        </div>
    )
}