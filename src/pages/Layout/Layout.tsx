import { BadgePlus, Sun, Moon, User, Compass } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
export default function Layout() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const path = useLocation().pathname;
    function switchTheme() {
        if (theme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    }

    const activeStyle = "text-red-400 transition-colors";
    const bounceStyle = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275)";

    return (
        <div className="">
            <Toaster />
            <div className="transition-all fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-accent gap-5 border rounded-full p-4 pl-10 pr-10 flex items-center justify-center z-10">
                <button
                    onClick={() => navigate("/")}
                    className="hover:animate-spin active:scale-99 duration-200  hover:scale-120 transition-all hover:cursor-pointer"
                    style={{
                        transition: bounceStyle,
                    }}
                >
                    <Compass
                        size={35}
                        className={path === "/" ? activeStyle : ""}
                    />
                </button>
                <button
                    className="hover:animate-spin active:scale-99 hover:scale-120 transition-all hover:cursor-pointer"
                    style={{
                        transition: bounceStyle,
                    }}
                    onClick={() => navigate("/draw")}
                >
                    <BadgePlus
                        size={35}
                        className={path === "/draw" ? activeStyle : ""}
                    />
                </button>
                <button
                    onClick={() => switchTheme()}
                    className="hover:animate-in active:scale-99 hover:scale-120 transition-all hover:cursor-pointer"
                    style={{
                        transition: bounceStyle,
                    }}
                >
                    {theme === "light" ? <Moon size={35} /> : <Sun size={35} />}
                </button>
                <button
                    onClick={() => navigate("/login")}
                    className="hover:animate-bounce active:scale-99 duration-200 hover:scale-120 transition-all hover:cursor-pointer"
                    style={{
                        transition: bounceStyle,
                    }}
                >
                    <User
                        size={35}
                        className={path === "/me" ? activeStyle : ""}
                    />
                </button>
                <span className="font-mono opacity-50">{path}</span>
            </div>
            <Outlet />
        </div>
    );
}
