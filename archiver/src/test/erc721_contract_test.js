const GalleryERC721 = artifacts.require('GalleryERC721')
const ERC721Receiver = artifacts.require('NFTokenReceiverTestMock')


require('chai')
.use(require('chai-as-promised'))
.should()

function printLogs(title, logs) {
    for (let i = 0; i < logs.length; i++) {
        console.log();
        console.log(`${title} event #${i + 1}:`);
        console.log(JSON.stringify(logs[i], null, 4));
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

contract('ERC721', ([owner, userOne, userTwo , userThree]) => {
    let erc721
    let erc721Receiver
    let ipfsHashes = []
    let ipfsHashUrls = []
    let receiverContract 

    function generateIpfsTestData(count){
        for(var i =0 ; i < count ;i++){
            var ipfsHash = makeid(25)
            ipfsHashes.push(ipfsHash)
            ipfsHashUrls.push("ipfs://"+ipfsHash)
        }
    }

    before(async () => {
        // Load Contracts
        generateIpfsTestData(10)

        erc721 = await GalleryERC721.new('GalleryERC721','XOXO')
        erc721Receiver = await ERC721Receiver.new()
        receiverContract  = erc721Receiver.address
    })

    describe('Verify Contract Name ', async () => {
        it('matches name successfully', async () => {
            const name = await erc721.name()
            assert.equal(name, 'GalleryERC721')
        })
    })

    describe('Verify Contract Symbol ', async () => {
        it('matches symbol successfully', async () => {
            const symbol = await erc721.symbol()
            assert.equal(symbol, 'XOXO')
        })
    })

    describe('Mint Token And Verify', async () => {
    
        it('mint tokens',async  () => {
            await  erc721.mintToken(userOne,ipfsHashes[1],ipfsHashUrls[1], {from: userOne})
            await  erc721.mintToken(userOne,ipfsHashes[2],ipfsHashUrls[2], {from: userOne})

            await  erc721.mintToken(userTwo,ipfsHashes[3],ipfsHashUrls[3], {from: userTwo})

            await  erc721.mintToken(userOne,ipfsHashes[4],ipfsHashUrls[4], {from: userOne})
        })

        it('verify token urls',async  () => {
            var tokenUri = await erc721.tokenURI(1)
            assert.equal(tokenUri.toString(),ipfsHashUrls[1],'Token 1 uri does not match with ipfs hash uri')

            tokenUri = await erc721.tokenURI(2)
            assert.equal(tokenUri.toString(),ipfsHashUrls[2],'Token 2 uri does not match with ipfs hash uri')
            
            tokenUri = await erc721.tokenURI(3)
            assert.equal(tokenUri.toString(),ipfsHashUrls[3],'Token 3 uri does not match with ipfs hash uri')

        })

        it('check userOne balance is 3',async  () => {
            var balance = await erc721.balanceOf(userOne)
            assert.equal(balance,3,'balance return is not 3')
        })

        it('check userTwo balance is 1',async  () => {
            var balance = await erc721.balanceOf(userTwo)
            assert.equal(balance,1,'balance return is not 1')
        })



        it('token owners',async  () => {
            var tokenOwner = await erc721.ownerOf(1)
            assert.equal(tokenOwner,userOne,'Token 1 owner does not match')

            tokenOwner = await erc721.ownerOf(2)
            assert.equal(tokenOwner,userOne,'Token 2 owner does not match')

            tokenOwner = await erc721.ownerOf(3)
            assert.equal(tokenOwner,userTwo,'Token 3 owner does not match')
        })

        it('transfer token 2 from userOne to userTwo',async  () => {
            await erc721.safeTransferFrom(userOne ,userTwo ,2, {
                from: userOne
            })
        })
        

        it('verify transfer of token 2', async () =>{
            var balance = await erc721.balanceOf(userTwo)
            assert.equal(balance,2,'balance return is not 2')

            balance = await erc721.balanceOf(userOne)
            assert.equal(balance,2,'balance return is not 2')

            tokenOwner = await erc721.ownerOf(2)
            assert.equal(tokenOwner,userTwo,'Token 2 owner does not match')
        })

        it('Approve userThree for transfer of token 2', async () =>{
            await erc721.approve(userThree,2,{
                from: userTwo
            })
        })

        it('Verify approved user for transfer of token 2', async () =>{
            const approvedUser = await erc721.getApproved(2)
            assert.equal(userThree,approvedUser)
        })

        it('transfer token 2 from userTwo to userThree by userThree',async  () => {
            
            await erc721.safeTransferFrom(userTwo ,userThree ,2,  {
                from: userThree
            })
        })

        it('verify transfer of token 2', async () =>{
            var balance = await erc721.balanceOf(userThree)
            assert.equal(balance,1,'balance return is not 1')
            tokenOwner = await erc721.ownerOf(2)
            assert.equal(tokenOwner,userThree,'Token 2 owner does not match')
        })

        it('set userTwo as approverForAll tokens of userOne', async () => {
            await erc721.setApprovalForAll(userTwo,true,{
                from: userOne
            })
        })

        it('verify userTwo is approverForAll tokens of userOne', async () =>{
            const approval = await erc721.isApprovedForAll(userOne,userTwo)
            assert.equal(true,approval)
        })

        it('transfer token 4 from userOne to userTwo by userTwo',async  () => {
            
            await erc721.safeTransferFrom(userOne ,userTwo ,4, {
                from: userTwo
            })
        })

        it('verify transfer of token 4', async () =>{
            var balance = await erc721.balanceOf(userTwo)
            assert.equal(balance,2,'balance return is not 2')
            tokenOwner = await erc721.ownerOf(4)
            assert.equal(tokenOwner,userTwo,'Token 4 owner does not match')
        })


        it('Burn token' , async () => {
            await erc721.safeBurn(2, {from: userThree})
        })

        it('verify burn of token 2', async () =>{
            var balance = await erc721.balanceOf(userThree)
            assert.equal(balance,0,'balance return is not 0')
            tokenOwner = await erc721.ownerOf(2)
            assert.equal(tokenOwner,0,'Token 2 owner does not match')
        })

        it('Verify Contract Transfer', async () => {
            
            await erc721.safeTransferFrom(userTwo ,receiverContract ,4,{
                from: userTwo
            })
        })

        it('verify transfer of token 4', async () =>{
            var balance = await erc721.balanceOf(receiverContract)
            assert.equal(balance,1,'balance return is not 1')
            tokenOwner = await erc721.ownerOf(4)
            assert.equal(tokenOwner,receiverContract,'Token 4 owner does not match')
        })
    })

});
