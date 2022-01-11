/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'hardhat'

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log('Deploying contracts with the account:', deployer.address)
	console.log('Account balance:', (await deployer.getBalance()).toString())
	const adminAddress = process.env.ADMIN!
	const registryAddress = process.env.REGISTRY!

	console.log(`admin address:${adminAddress}`)
	console.log(`registry address:${registryAddress}`)

	// GitHubMarket
	const treasuryV2Factory = await ethers.getContractFactory('TreasuryV2')
	const treasuryV2 = await treasuryV2Factory.deploy()
	await treasuryV2.deployed()

	console.log(`logic address:${treasuryV2.address}`)

	const data = ethers.utils.arrayify('0x')

	const treasuryProxyFactory = await ethers.getContractFactory('TreasuryProxy')
	const treasuryProxy = await treasuryProxyFactory.deploy(
		treasuryV2.address,
		adminAddress,
		data
	)
	await treasuryProxy.deployed()
	console.log(`proxy address:${treasuryProxy.address}`)

	const proxy = treasuryV2Factory.attach(treasuryProxy.address)
	await proxy.initialize(registryAddress)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Memo
// update .env file
// and execute this command
// npx hardhat run --network arbitrumRinkeby scripts/deploy-treasury.ts
