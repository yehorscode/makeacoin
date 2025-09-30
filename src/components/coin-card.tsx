const CoinCard = () => {
    // TODO: Make the bg color change in accordance to the coin's accent (colour)
    // TODO: Make the thing actually fucking work
    return <div className="border-black border-2 rounded-2xl overflow-hidden w-fit p-3 flex flex-col gap-2 items-left hover:bg-green-500 transition-all">
        <img src="https://placehold.co/300x300" alt="Coin" className=""/>
        <div className="flex flex-col text-left">
            <span className="font-mono text-2xl">Coin Name Here</span>
            <span className="opacity-60 font-mono">Made by @username</span>
        </div>
    </div>;
};

export default CoinCard;
