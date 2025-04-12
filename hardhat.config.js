require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */
const developementChain = ["hardhat", "localhost"]
module.exports = {
    developementChain,
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
