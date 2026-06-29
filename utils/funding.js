import { fetchWithTimeout } from "./fetchWithTimeout.js";

const API_KEY = process.env.ALCHEMY_API_KEY;
const url = `https://base-mainnet.g.alchemy.com/v2/${API_KEY}`;

export async function getFundingInfo(address) {
    try {
        const payload = {
            id: 1,
            jsonrpc: "2.0",
            method: "alchemy_getAssetTransfers",
            params: [{
                fromBlock: "0x0",
                toBlock: "latest",
                toAddress: address.toLowerCase(),
                category: ["external"],
                excludeZeroValue: true,
                maxCount: "0x3e8",
                withMetadata: true
            }]
        };

        // Correct format passing the full config block directly inside the timeout wrapper
        const res = await fetchWithTimeout(url, 8000, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        const transfers = data.result?.transfers;

        if (!Array.isArray(transfers) || transfers.length === 0) {
            return {
                walletFundedBy: null,
                firstFundingAmount: null,
                firstFundingDate: null,
                fundingTxHash: null
            };
        }

        const firstFunding = transfers[0];

        return {
            walletFundedBy: firstFunding.from,
            firstFundingAmount: firstFunding.value,
            firstFundingDate: firstFunding.metadata?.blockTimestamp || null,
            fundingTxHash: firstFunding.hash
        };

    } catch (err) {
        console.error("Funding fetch error:", err.message);
        return {
            walletFundedBy: null,
            firstFundingAmount: null,
            firstFundingDate: null,
            fundingTxHash: null
        };
    }
}

