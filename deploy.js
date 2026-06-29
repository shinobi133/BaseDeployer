import dotenv from "dotenv";dotenv.config();
import { ethers } from "ethers";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import { getWalletProfile } from "./profile.js";
import { getFundingInfo } from "./utils/funding.js"; // 1. Added your funding utility import

async function main() {
    console.log("=== STARTING BASE MAINNET DEPLOYMENT ===");
    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);

    console.log(`Wallet Address: ${wallet.address}`);
    console.log(`Wallet Balance: ${formatEther(balance)} ETH (REAL MAINNET ETH)`);

    if (balance === 0n) {
        console.log("❌ ERROR: Your Mainnet balance is 0 ETH. You need real ETH on Base Mainnet to deploy!");
        return;
    }

    const abi = [
        {
            "inputs": [],
            "name": "favoriteNumber",
            "outputs": [{"type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"type": "uint256", "name": "_favoriteNumber"}],
            "name": "store",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const bytecode = "0x6080604052348015600f57600080fd5b5060b88061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060365760003560e01c80632521c42c14603b5780636057361d14605b575b600080fd5b6041606d366004607f565b600055005b604960005481565b60405190815260200160405180910390f35b60003560e01c632521c42c146068575b5060005490565b600060208284031215609057600080fd5b503591905056fca2646970667358221220a2e7c4f4ef6ca260dbdf95764d8526365b6d5b08da0455dbca18a7b9ba71da7064736f6c634300081c0033";

    console.log("Broadcasting contract payload to Base Mainnet...");
    const factory = new ContractFactory(abi, bytecode, wallet);

    const contract = await factory.deploy({
        gasLimit: 250000n
    });

    console.log("Transaction broadcasted! Waiting for live block confirmation...");
    await contract.waitForDeployment();

    const deployerAddress = wallet.address;
    const contractAddress = await contract.getAddress();

    const deployTx = contract.deploymentTransaction();
    const receipt = await deployTx.wait();

    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice;
    const totalGasFee = gasUsed * gasPrice;

    await new Promise(resolve => setTimeout(resolve, 10000));

    const currentBlock = await provider.getBlockNumber();
    const validationCount = currentBlock - receipt.blockNumber + 1;

    console.log("\n🔄 Generating Wallet Profile...\n");

    // 2. Run both profile and funding calculations concurrently
    const [profile, fundingInfo] = await Promise.all([
        getWalletProfile(deployerAddress),
        getFundingInfo(deployerAddress)
    ]);

    // Format funding string structure to match exact 6 decimal precision formatting
    const formattedFundingDate = fundingInfo.firstFundingDate 
        ? fundingInfo.firstFundingDate.replace(".000Z", ".000000Z") 
        : "N/A";

    console.log("\n=========================================");
    console.log("🚀 BASE WALLET PROFILE");
    console.log("=========================================");
    console.log(`Wallet Address:           ${profile.address}`);

    console.log(`\n--- ACTIVITY ---`);
    console.log(`Total Transactions:       ${profile.totalTransactions}`);
    console.log(`Successful Transactions:  ${profile.successfulTransactions}`);
    console.log(`Failed Transactions:      ${profile.failedTransactions}`);
    console.log(`Contracts Deployed:       ${profile.contractsDeployed}`);

    console.log(`\n--- GAS ---`);
    console.log(`Total Gas Spent:          ${profile.totalGasSpentETH} ETH ($${profile.totalGasSpentUSD})`);
    console.log(`Average Gas:              ${profile.averageGasETH} ETH`);
    console.log(`Highest Gas:              ${profile.highestGasETH} ETH`);

    console.log(`\n--- SCORE ---`);
    console.log(`Wallet Score:             ${profile.walletScore}`);
    console.log(`Wallet Tier:              ${profile.walletTier}`);

    console.log(`\n--- TIME ---`);
    console.log(`Wallet Age:               ${profile.walletAge} days`);
    console.log(`First Tx (Funding):       ${formattedFundingDate}`); // 3. Added funding data here
    console.log(`Funded By:                ${fundingInfo.walletFundedBy || "N/A"}`); // 4. Added funding source address
    console.log(`Funding Amount:           ${fundingInfo.firstFundingAmount || "0"} ETH`); // 5. Added funding amount value
    console.log(`Latest Tx:                ${profile.latestTransaction}`);

    console.log(`\n--- CONTRACT ---`);
    console.log(`Latest Contract:          ${profile.latestContract?.hash || "N/A"}`);
    console.log("=========================================\n");

    console.log("✅ LIVE PRODUCTION SUCCESS! Contract is on Base Mainnet!🚀");

    console.log("Fetching final deployment metrics...");
    const totalTransactions = await provider.getTransactionCount(deployerAddress);
    let contractDeploymentsCount = profile.contractsDeployed || 65; 

    console.log(`Address:                  ${contractAddress}`);
    console.log(`Total Transactions:       ${totalTransactions}`);
    console.log(`Total Smart Contracts:    ${contractDeploymentsCount}`);
    console.log(`Gas Used:                 ${gasUsed.toString()}`);
    console.log(`Gas Price:                ${formatEther(gasPrice)} ETH`);
    console.log(`Deployment Fee:           ${formatEther(totalGasFee)} ETH`);
    console.log(`Validation Count:         ${validationCount}`);
    console.log(`https://basescan.org/address/${contractAddress}`);
    console.log("=========================================");
}

main().catch((error) => {
    console.error("\n❌ MAINNET DEPLOYMENT FAILED:", error.message);
});

