export async function getContracts(address) {
    let nextUrl = `https://base.blockscout.com/api/v2/addresses/${address}/transactions`;

    let contractList = [];

    try {
        while (nextUrl) {
            const response = await fetch(nextUrl);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data.items)) {
                const contracts = data.items
                    .filter(tx => tx.to === null)
                    .map(tx => ({
                        hash: tx.hash,
                        block: tx.block_number,
                        timestamp: tx.timestamp
                    }));

                contractList.push(...contracts);
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

        const contractsDeployed = contractList.length;

        // sort newest first
        contractList.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        );

        const latestContract =
            contractList.length > 0
                ? contractList[0]
                : null;

        return {
            contractsDeployed,
            latestContract,
            contractList
        };

    } catch (error) {
        console.error("Contract fetch error:", error.message);

        return {
            contractsDeployed: 0,
            latestContract: null,
            contractList: []
        };
    }
}
