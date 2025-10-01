const CoinCard = () => {
    // TODO: Make the bg color change in accordance to the coin's accent (colour)
    // TODO: Make the thing actually fucking work
    return <div className="hover:scale-105 border-border border-2 bg-accent rounded-2xl overflow-hidden w-fit p-3 flex flex-col gap-2 items-left dark:hover:bg-green-800 hover:bg-green-400 transition-all duration-250">
        <img src="https://placehold.co/300x300" alt="Coin" className=""/>
        <div className="flex flex-col text-left">
            <span className="font-mono text-2xl">Coin Name Here</span>
            <span className="opacity-60 font-mono">Made by @username</span>
        </div>
    </div>;
};

export default CoinCard;
