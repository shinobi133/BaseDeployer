import { getTransactions } from "./utils/transactions.js";
import { getContracts } from "./utils/contracts.js";
import { getFundingInfo } from "./utils/funding.js";
import { getGasStats } from "./utils/gas.js";
import { getEthPrice } from "./utils/ethPrice.js";
import { getWalletScore } from "./utils/score.js";

export async function getWalletProfile(address) {
    try {
        console.log("🔄 Building wallet profile...");

        // 1. Core data
        const txData = await getTransactions(address);
        const contractData = await getContracts(address);
        const fundingData = await getFundingInfo(address);

        // 2. Gas stats (needs transactions)
        const gasData = await getGasStats(address);

        // 3. ETH price
        const ethPrice = await getEthPrice();

        // 4. Score engine input
        const scoreData = getWalletScore({
            totalTransactions: txData.totalTransactions,
            contractsDeployed: contractData.contractsDeployed,
            successfulTransactions: txData.successfulTransactions,
            walletAge: txData.walletAge
        });

        // 5. USD conversions
        const totalGasUSD =
            Number(gasData.totalGasSpentETH) * ethPrice;

        const balanceUSD = null; // optional later (needs balance fetch)

        // 6. Build final profile
        const profile = {
            address,

            // Transactions
            totalTransactions: txData.totalTransactions,
            successfulTransactions: txData.successfulTransactions,
            failedTransactions: txData.failedTransactions,

            // Contracts
            contractsDeployed: contractData.contractsDeployed,
            latestContract: contractData.latestContract,

            // Funding
            walletFundedBy: fundingData.walletFundedBy,
            firstFundingAmount: fundingData.firstFundingAmount,
            firstFundingDate: fundingData.firstFundingDate,

            // Gas
            totalGasSpentETH: gasData.totalGasSpentETH,
            totalGasSpentUSD: totalGasUSD.toFixed(4),
            averageGasETH: gasData.averageGasETH,
            highestGasETH: gasData.highestGasETH,

            // Time
            firstTransaction: txData.firstTransaction,
            latestTransaction: txData.latestTransaction,
            walletAge: txData.walletAge,

            // Score
            walletScore: scoreData.score,
            walletTier: scoreData.tier,
            breakdown: scoreData.breakdown,

            // Market
            ethPriceUSD: ethPrice
        };

        return profile;

    } catch (err) {
        console.error("Profile build error:", err.message);

        return null;
    }
}
