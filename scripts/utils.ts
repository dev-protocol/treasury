import { ethers } from 'hardhat'
import { Admin, UpgradeableProxy } from '../typechain-types'

export const deployAdmin = async (): Promise<Admin> => {
	const adminFactory = await ethers.getContractFactory('Admin')
	const admin = await adminFactory.deploy()
	return admin.deployed()
}

export const deployProxy = async (
	impl: string,
	admin: string,
	data: Readonly<Uint8Array>
): Promise<UpgradeableProxy> => {
	const upgradeableProxyFactory = await ethers.getContractFactory(
		'UpgradeableProxy'
	)
	const upgradeableProxy = await upgradeableProxyFactory.deploy(
		impl,
		admin,
		data
	)
	return upgradeableProxy.deployed()
}
