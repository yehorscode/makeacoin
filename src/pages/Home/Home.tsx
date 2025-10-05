import CoinCard from "@/components/coin-card"
import { tablesDB, databaseId, collectionId } from "@/components/appwrite"
import { useEffect, useState } from "react";

interface RawCoin {
    $id: string;
    username: string,
    coin_name: string,
    front_id: string,
    back_id: string,
}

interface Coin extends RawCoin {
    front_image: string,
    back_image: string,
}

export default function Home() {
    const [data, setData] = useState<Coin[]>([]);

    useEffect(() => {
        (async () => {
            const response = await tablesDB.listRows({
                databaseId: databaseId,
                tableId: collectionId,
            });
            const rawCoins = (response as any).rows as RawCoin[];
            const processedCoins = await Promise.all(rawCoins.map(async (coin) => {
                return {
                    ...coin,
                    front_image: coin.front_id,
                    back_image: coin.back_id,
                };
            }));
            setData(processedCoins);
        })();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 p-10">
            {data.map((coin) => (
                <CoinCard key={coin.$id} username={coin.username} coin_name={coin.coin_name} front_image={coin.front_image} back_image={coin.back_image} />
            ))}
        </div>
    )
}