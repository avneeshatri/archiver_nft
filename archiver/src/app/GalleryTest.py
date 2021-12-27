from ArchiverService import ArchiverService
import string
import random

def main():
    prop = '/home/atri/workspace_ethereum/ethapp/archiver/src/app/archiver.properties'
    handler = ArchiverService( prop)
  #  user_address = '0xD3466e90C467Aa745a721af22ad3fEBf5A0009Da'
    user_address = '0xE1a27103bff937F44c4a4aD94216D18270839926'
    ipfsHash = 'QmUaMhC4zanDsJR6XiX8CnQB9gtMqJ32JJdauw1iM' + id_generator()
    ipfsUri = 'https://ipfs.io/ipfs/' + ipfsHash
    handler.mint_token(user_address,ipfsHash,ipfsUri)
    tokens = handler.get_user_tokens(user_address)
    print('tokens: '+str(tokens))
    balance = handler.user_token_balance(user_address)
    print('balance:'+str(balance))

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

if __name__ == "__main__":
    main()