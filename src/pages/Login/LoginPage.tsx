import { GithubDark } from "@/components/ui/svgs/githubDark";
import { account } from "@/components/appwrite";
import { OAuthProvider } from "appwrite";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function LoginPage() {
    const { theme } = useTheme();
    useEffect(() => {
        document.title = "makeacoin ";
    }, []);

    function loginWGithub() {
        account.createOAuth2Session({
            provider: OAuthProvider.Github,
            success: window.location.origin,
            failure: window.location.origin,
            scopes: ["user", "user:email"]
        });
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function registerWEmail() {
        await account.create({
            email: email,
            password: password,
            userId: "unique()"
        });
    }

    async function loginWEmail() {
        await account.createEmailPasswordSession({
            email: email,
            password: password,
        });
    }

    async function logout() {
        await account.deleteSession({
            sessionId: "current"
        })
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await account.get();
                console.log(user);
            } catch (e) {
                console.log("No user logged in");
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="">
            <div className="bg-accent rounded-xl border py-10 flex flex-col justify-center items-center">
                <h1 className="font-mono text-2xl">Let's Login (alright?)</h1>
                <span className="text-sm opacity-70">
                    You don't have a choice except for github heheheh
                </span>
                {theme === "dark" ? (
                    <button
                        onClick={loginWGithub}
                        className="mt-4  flex gap-4 items-center bg-foreground p-2 rounded-lg px-5 text-card font-mono hover:scale-105 transition-all"
                    >
                        <GithubLight className="w-7" />
                        Log In with Github
                    </button>
                ) : null}
                {theme === "light" ? (
                    <button
                        onClick={loginWGithub}
                        className="mt-4  flex gap-4 items-center bg-foreground p-2 rounded-lg px-5 text-card font-mono hover:scale-105 transition-all"
                    >
                        <GithubDark className="w-7" />
                        Log In with Github
                    </button>
                ) : null}
                <Button onClick={logout}>Logout</Button>
            </div>
            <div className="bg-accent mt-5 rounded-xl border py-10 flex flex-col justify-center items-center">
                <h1 className="font-mono text-2xl">
                    Or a more <i>classic</i> approach?
                </h1>
                <div className="w-100 text-left mt-5 gap-3 flex flex-col">
                    <div className="flex  flex-col text-left">
                        <span>Email</span>
                        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span>Password</span>
                        <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={registerWEmail}>Register</Button>
                    <Button onClick={loginWEmail}>Login</Button>
                </div>
            </div>
        </div>
    );
}
