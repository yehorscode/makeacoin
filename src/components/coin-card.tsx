interface CoinCardProps {
    username: string;
    coin_name: string;
    front_image: string;
    back_image: string;
}

const CoinCard: React.FC<CoinCardProps> = ({
    username,
    coin_name,
    front_image,
    back_image,
}) => {
    return <div className="hover:scale-105 border-border border-2 bg-accent rounded-2xl overflow-hidden w-fit p-3 flex flex-col gap-2 items-left dark:hover:bg-green-600 hover:bg-green-400 transition-all duration-250">
        <img src={front_image} alt="Coin" className="rounded-full"/>
        <img src={back_image} alt="Coin" className="rounded-full"/>
        <div className="flex flex-col text-left">
            <span className="font-mono text-2xl">{coin_name}</span>
            <span className="opacity-60 font-mono">Made by @{username}</span>
        </div>
    </div>;
};

export default CoinCard;
