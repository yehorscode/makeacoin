import CoinCard from "@/components/coin-card"

export default function Home() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 p-10">
            <CoinCard />
            <CoinCard />
            <CoinCard />
            <CoinCard />
            <CoinCard />
        </div>
    )
}