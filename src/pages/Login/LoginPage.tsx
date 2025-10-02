import { Slack } from "@/components/ui/svgs/slack";
import { account } from "@/components/appwrite";
import { OAuthProvider } from "appwrite";
export default function LoginPage() {

    function loginWSlack() {
        account.createOAuth2Session({
            provider: OAuthProvider.Slack,
            success: window.location.origin,
            failure: window.location.origin,
            scopes: ["openid", "email", "profile"]
        });
    }

    return (
        <div className="bg-accent rounded-xl border py-10 flex flex-col justify-center items-center">
            <h1 className="font-mono text-2xl">Let's Login (alright?)</h1>
            <span className="text-sm opacity-70">
                You don't have a choice except for slack heheheh
            </span>
            <button onClick={loginWSlack} className="mt-4 grayscale hover:grayscale-0 flex gap-4 items-center bg-foreground p-2 rounded-lg px-5 text-card font-mono hover:scale-105 transition-all">
                <Slack className="w-7" />
                Log In with Slack
            </button>
        </div>
    );
}
