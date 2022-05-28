const { assert } = require('chai');

const Color = artifacts.require("Color");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract ('Color', (accounts) => {
    let contract 

    before(async () => {
        contract = await Color.deployed()
    })

    describe('deployment', async () => {
        it('deployed successfully', async () => {
            const address = contract.address
            assert.notEqual(address, '')
            assert.notEqual(address, 0x0)
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })      
        
        it('has a name', async () => {
            const name = await contract.name()
            assert.equal(name, 'Color')
        }) 
        
        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol, 'COLOR')
        }) 
    })

    describe('minting', async () => {
        it('creates a new token', async () => {
            const result = await contract.mint('#FFFFFF')
            //const balanceOf = await contract.balanceOf(contract.address)
            // SUCCESS
            //assert.equal(balanceOf, 1)    
            const event = result.logs[0].args
            assert.equal(event.tokenId.toNumber(), 0, 'id is correct')
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
            assert.equal(event.to, accounts[0], 'to is correct')
            
            const balance = await contract.balanceOf(accounts[0])
            assert.equal(balance, 1)
            // FAILURE
            await contract.mint('#FFFFFF').should.be.rejected
        })              
    })

    describe('minting', async () => {
        it('lists colors', async () => {
            // Mint 3 tokens
            await contract.mint('#FFFF00')
            await contract.mint('#000000')
            await contract.mint('#FF0000')

            let color
            let result = []

            for (var i = 0; i < 4; i++) {
                color = await contract.colors(i)
                result.push(color)
            }

            let expected = ['#FFFFFF', '#FFFF00', '#000000', '#FF0000']
            assert.equal(result.join(','), expected.join(','))
        })
    })
})