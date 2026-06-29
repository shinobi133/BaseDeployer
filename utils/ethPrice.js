export async function getEthPrice() {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        const price = data?.ethereum?.usd;

        return price || 0;

    } catch (err) {
        console.error("ETH price fetch error:", err.message);
        return 0;
    }
}
