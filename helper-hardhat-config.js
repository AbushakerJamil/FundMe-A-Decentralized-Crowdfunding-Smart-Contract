const networkConfig = {
    421614: {
        //any net you can provide
        name: "Arbitrum Sepolia Testnet",
        ethUsdPriceFeed: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    },
    84532: {
        name: " BASE Sepolia Testnet",
        ethUsdPriceFeed: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    },
    // 31337,
}

const developmetChain = ["hardhat", "localhost"]
const DECIMALS = 8
const INIATIAL_ANS = 20000000000

module.exports = {
    networkConfig,
    developmetChain,
    DECIMALS,
    INIATIAL_ANS,
}
