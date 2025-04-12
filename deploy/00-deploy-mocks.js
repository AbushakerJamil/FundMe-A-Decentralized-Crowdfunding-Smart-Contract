const { network } = require("hardhat")
const {
    developmetChain,
    DECIMALS,
    INIATIAL_ANS,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    if (developmetChain.includes(network.name)) {
        log("Local network detected Deploy mocks......__")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INIATIAL_ANS],
            log: true,
        })

        log("Mocks Deployed!")
        log("____________...____________")
    }
}

module.exports.tags = ["all", "mocks"]
