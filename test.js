import { getTransactions } from "./utils/transactions.js";

const wallet = "YOUR_WALLET_HERE";

const data = await getTransactions(wallet);

console.log("===== WALLET TRANSACTION SUMMARY =====");
console.log(`Total Transactions: ${data.totalTransactions}`);
console.log(`Successful: ${data.successfulTransactions}`);
console.log(`Failed: ${data.failedTransactions}`);
console.log(`First Tx: ${data.firstTransaction}`);
console.log(`Latest Tx: ${data.latestTransaction}`);
console.log(`Wallet Age (days): ${data.walletAge}`);
console.log("======================================");
