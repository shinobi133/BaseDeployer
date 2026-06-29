import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://mainnet.base.org");

export async function getTransactions(address) {
    let nextUrl = `https://base.blockscout.com/api/v2/addresses/${address}/transactions`;

    const transactions = [];

    while (nextUrl) {
        const response = await fetch(nextUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions (${response.status})`);
        }

        const data = await response.json();

        if (Array.isArray(data.items)) {
            transactions.push(...data.items);
        }

        if (data.next_page_params) {
            const params = new URLSearchParams(
                data.next_page_params
            ).toString();

            nextUrl = `https://base.blockscout.com/api/v2/addresses/${address}/transactions?${params}`;
        } else {
            nextUrl = null;
        }
    }

    const totalTransactions = transactions.length;

    const successfulTransactions =
        transactions.filter(tx => tx.status === "ok").length;

    const failedTransactions =
        totalTransactions - successfulTransactions;

    // Sort oldest -> newest
    transactions.sort(
        (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()
    );

    const firstTransaction =
        transactions.length > 0
            ? transactions[0].timestamp
            : null;

    const latestTransaction =
        transactions.length > 0
            ? transactions[transactions.length - 1].timestamp
            : null;

    let walletAge = 0;

    if (firstTransaction) {
        walletAge = Math.floor(
            (Date.now() - new Date(firstTransaction).getTime()) /
                (1000 * 60 * 60 * 24)
        );
    }

    return {
        transactions,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        firstTransaction,
        latestTransaction,
        walletAge
    };
}
