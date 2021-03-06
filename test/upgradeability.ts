import { expect, use } from 'chai'
import { Contract, Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import {
	TreasuryAdminTest,
	TreasuryV2,
	TreasuryProxy,
} from '../typechain-types'

use(solidity)

describe('Treasury Upgradeability', () => {
	let other: Signer

	let treasuryV1: TreasuryV2
	let admin: TreasuryAdminTest
	let proxy: TreasuryProxy
	let proxified: Contract

	beforeEach(async () => {
		;[, other] = await ethers.getSigners()

		const treasuryFactory = await ethers.getContractFactory('TreasuryV2')
		treasuryV1 = await treasuryFactory.deploy()

		const adminFactory = await ethers.getContractFactory('TreasuryAdminTest')
		admin = await adminFactory.deploy()

		const proxyFactory = await ethers.getContractFactory('TreasuryProxy')
		proxy = await proxyFactory.deploy(
			treasuryV1.address,
			admin.address,
			utils.toUtf8Bytes('')
		)

		proxified = treasuryV1.attach(proxy.address)
	})

	describe('Initialize', () => {
		it('proxyImplementation', async () => {
			const treasuryV1Address = await admin.getProxyImplementation(
				proxified.address
			)
			expect(treasuryV1Address).to.be.equal(treasuryV1.address)
		})
	})

	describe('Upgrade', async () => {
		let treasuryV2: TreasuryV2

		beforeEach(async () => {
			const treasuryV2Factory = await ethers.getContractFactory('TreasuryV2')
			treasuryV2 = await treasuryV2Factory.deploy()
		})

		describe('Success', () => {
			it('store new proxyImplementation', async () => {
				const proxyImplementation = await admin.getProxyImplementation(
					proxified.address
				)
				expect(proxyImplementation).to.be.equal(treasuryV1.address)

				await admin.upgrade(proxified.address, treasuryV2.address)

				const proxyImplementationV2 = await admin.getProxyImplementation(
					proxified.address
				)
				expect(proxyImplementationV2).to.be.equal(treasuryV2.address)
			})
		})

		describe('Fail', () => {
			it('revert if msg.sender is not admin', async () => {
				/* eslint-disable @typescript-eslint/no-floating-promises */
				expect(
					admin.connect(other).upgrade(proxified.address, treasuryV2.address)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
		})
	})
})
