export function getWalletScore(stats) {
    const {
        totalTransactions,
        contractsDeployed,
        successfulTransactions,
        walletAge
    } = stats;

    // 1. Transactions (log scale)
    const txScore = Math.min(
        1000,
        Math.log10(totalTransactions + 1) * 250
    );

    // 2. Contracts
    const contractScore = Math.min(
        800,
        contractsDeployed * 40
    );

    // 3. Success performance
    const successScore = Math.min(
        700,
        successfulTransactions * 5
    );

    // 4. Age factor
    const ageScore = Math.min(
        500,
        walletAge / 2
    );

    // FINAL SCORE
    let score = txScore + contractScore + successScore + ageScore;

    // HARD CAP
    score = Math.min(10000, Math.floor(score));

    // TIER SYSTEM (your custom ranges)
    let tier = "Iron Builder";

    if (score >= 3000) {
        tier = "Royal Builder";
    } else if (score >= 2500) {
        tier = "Legendary Builder";
    } else if (score >= 2000) {
        tier = "Platinum Builder";
    } else if (score >= 1500) {
        tier = "Gold Builder";
    } else if (score >= 1000) {
        tier = "Silver Builder";
    } else if (score >= 500) {
        tier = "Bronze Builder";
    } else if (score >= 200) {
        tier = "Iron Builder";
    }

    return {
        score,
        tier,
        breakdown: {
            txScore: Math.floor(txScore),
            contractScore: Math.floor(contractScore),
            successScore: Math.floor(successScore),
            ageScore: Math.floor(ageScore)
        }
    };
}
