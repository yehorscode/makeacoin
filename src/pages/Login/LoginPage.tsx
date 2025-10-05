// import { GithubDark } from "@/components/ui/svgs/githubDark";
import { account } from "@/components/appwrite";
import { ID, type Models } from "appwrite";
// import { OAuthProvider } from "appwrite";
// import { GithubLight } from "@/components/ui/svgs/githubLight";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [newUsername, setNewUsername] = useState("");

  async function registerWEmail() {
    try {
      await account.create({
        email: email,
        password: password,
        userId: ID.unique(),
      });
      toast.success("Registered successfully! Now click the login button.");
    } catch (e) {
      toast.error("Registration failed. Maybe you already logged in?");
      console.log(e);
    }
  }

  async function loginWEmail() {
    try {
      await account.createEmailPasswordSession({
        email: email,
        password: password,
      });
      const user = await account.get();
      setUserData(user);
      setIsLoggedIn(true);
      toast.success("Logged in successfully!");
    } catch (e) {
      toast.error("Login failed. Check your credentials.");
      console.log(e);
    }
  }

  async function logout() {
    await account.deleteSession({
      sessionId: "current",
    });
    setUserData(null);
    setIsLoggedIn(false);
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUserData(user);
        setIsLoggedIn(true);
      } catch (e) {
        console.log("No user logged in");
      }
    };
    fetchUser();
  }, []);
  function debugData() {
    console.log(userData);
    console.log("Isloggedin:", isLoggedIn);
    console.log("Email:", email);
    console.log("Password:", password);
  }
  async function updateUsername() {
    if (!newUsername) {
      toast.error("Username cannot be empty");
      return;
    }
    if (newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }
    if (newUsername.length > 20) {
      toast.error("Username must be at most 20 characters long");
      return;
    }
    await account.updateName({
      name: newUsername
    })
    window.location.reload();
  }
  return (
    <div className="">
      <div className="mt-2 flex bg-accent items-center justify-between gap-3 rounded-md border p-3 text-sm">
        {isLoggedIn && userData ? (
          <div className="flex w-full items-center justify-between">
            <span>
              Logged in as <b className="blur-sm hover:blur-none transition-all">{userData.email}</b>
            </span>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
      <div className="">
        {isLoggedIn && userData ? (
          <div className="bg-accent mt-5 rounded-xl border py-10 flex flex-col justify-center items-center">
            <h1 className="text-3xl font-mono">
              Hi {userData?.name ?? "guest"}!
            </h1>
            <div className="">
              <div className="flex flex-col gap-3">
                <span className="opacity-80">Change username:</span>
                <Input placeholder="new username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}></Input>
                <Button onClick={updateUsername}>Change username to <span className="font-mono">{newUsername}</span></Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden">
            <div className="">
              <h1>Log in to see your profile and customize it</h1>
            </div>
          </div>
        )}
      </div>
      {/* <div className="bg-accent rounded-xl border py-10 flex flex-col justify-center items-center">
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
            </div> */}
      <div className="bg-accent mt-5 rounded-xl border py-10 flex flex-col justify-center items-center">
        <h1 className="font-mono text-2xl">Login Using this old-ahh form</h1>
        <div className="w-100 text-left mt-5 gap-3 flex flex-col">
          <div className="flex  flex-col text-left">
            <span>Email</span>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col text-left">
            <span>Password</span>
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={loginWEmail} disabled={isLoggedIn}>
            Login
          </Button>
          <Button
            onClick={registerWEmail}
            variant={"outline"}
            disabled={isLoggedIn}
          >
            Register
          </Button>
          <span className="opacity-80 font-mono text-xs">
            Note: To register: 1. Fill out form with email and password 2. Click
            register. Done. Then you can log in immediattely
          </span>
        </div>
      </div>
      <button onClick={debugData}>debug</button>
    </div>
  );
}
