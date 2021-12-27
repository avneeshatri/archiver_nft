const ERC20Basic = artifacts.require('ERC20Basic')


require('chai')
.use(require('chai-as-promised'))
.should()

contract('ERC20Basic', ([owner, customer, buyer]) => {
    let erc20
    tokensTotalSupply = '1000000'
    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before(async () => {
        // Load Contracts
        erc20 = await ERC20Basic.new(tokens(tokensTotalSupply))
    })
    

    describe('IErc20 balance check', async () => {
        it('total suppy check', async () => {
            const balance = await erc20.totalSupply()
	        const ownerBalace = await erc20.balanceOf(owner)
            assert.equal(balance.toString(),tokens(tokensTotalSupply)) 
	        assert.equal(ownerBalace.toString(),tokens(tokensTotalSupply))
        })
    })

    
    describe('Tasaction Flow Test', async () => {
        it('balance transfer ,approve , allowance , transferFrom test', async () => {
            let result
	     
            customerInitBalance = '1000'
	        // Transfer to customer 
	        result = await erc20.transfer(customer,tokens(customerInitBalance))

            // Check Customer Balance
            result = await erc20.balanceOf(customer)
           assert.equal(result.toString(), tokens(customerInitBalance), 'customer wallet inital balance check failed')
            
            // Check Approved balance
            result = await erc20.approve(owner, tokens('100'), {from: customer})
            result = await erc20.allowance(customer,owner, {from: customer})
	        assert.equal(result.toString(), tokens('100'), 'customer approved balance check failed')

            // trasfer from customer to buyer
	        result = await erc20.transferFrom(customer,buyer,tokens('100')) 

            // Check Updated Balance of Customer
            result = await erc20.balanceOf(customer)
            assert.equal(result.toString(), tokens('900'), 'customer balance check post transfer failed')     
            
            // Check Updated Balance of Decentral Bank
            result = await erc20.balanceOf(buyer)
            assert.equal(result.toString(), tokens('100'), 'buyer balance check post transfer failed')     
        
        })
    })
    
})
