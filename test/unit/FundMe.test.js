const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { expect, assert } = require("chai")

describe("FundMe", async function () {
    let deployer
    let fundMe
    let mockV3Aggregator
    const sendValue = ethers.parseEther("1")

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        const signer = await ethers.getSigner(deployer)
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt(
            "FundMe",
            fundMeDeployment.address,
            signer
        )

        const mockV3Deployment = await deployments.get("MockV3Aggregator")
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            mockV3Deployment.address,
            signer
        )
    })

    describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })
    })

    describe("fund", async () => {
        it("Fail if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Add funder to array of funds", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single funder", async () => {
            const provider = ethers.provider
            const startingFundMeBalance = await provider.getBalance(
                fundMe.target
            )
            const startingDeployerBalance = await provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasUsed = transactionReceipt.gasUsed
            const gasPrice = transactionReceipt.gasPrice
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await provider.getBalance(fundMe.target)
            const endingDeployerBalance = await provider.getBalance(deployer)

            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance),
                BigInt(endingDeployerBalance) + BigInt(gasCost)
            )
        })

        it("is allows us to withdraw with multiple funders", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${effectiveGasPrice}`)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            )
            // Make a getter for storage variables
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const fundMeConnectedContract = await fundMe.connect(attacker)

            // ✅ Fix: Custom error না থাকলে নরমাল revert চেক করো
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
    })
})
