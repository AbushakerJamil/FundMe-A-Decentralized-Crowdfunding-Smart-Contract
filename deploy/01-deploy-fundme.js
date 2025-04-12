// function deployFun() {}
// module.exports.defult = deployFun;

const { network } = require("hardhat")
const { networkConfig, developmetChain } = require("../helper-hardhat-config")
const { verify } = require("../uttils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeed
    if (developmetChain.includes(network.name)) {
        const etUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeed = etUsdAggregator.address
    } else {
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeed]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
    })
    if (
        !developmetChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("______________________________________")
}

module.exports.tags = ["all", "FundMe"]
