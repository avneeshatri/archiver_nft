import web3.logs
import Web3Util
from Web3Util import Web3Util


class GalleryErc721EthHandler:
    def __init__(self, url, contract_address, privateKey, abi_file, gas):
        self.w3Util = Web3Util(url)
        self.contract_address = contract_address
        self.contract = self.w3Util.load_contract(self.contract_address,abi_file)
        self.privateKey = privateKey
        self.gas = gas

    def mint(self, user_address, ipfs_cid, uri):
        txn = self.contract.functions.mintToken(user_address, ipfs_cid, uri).buildTransaction()
        txn.update({'gas': self.gas})
        account = self.w3Util.account_from_pk(self.privateKey)
        txn.update({'nonce': self.w3Util.get_transaction_count(account.address)})
        signed = self.w3Util.sign_transaction(txn, self.privateKey)
        result = self.w3Util.send_raw_transaction(signed.rawTransaction)
        tx_receipt = self.w3Util.w3.eth.getTransactionReceipt(result)
        print(tx_receipt)

    def balanceOf(self, user_address):
        result = self.contract.functions.balanceOf(user_address).call()
        return result

    def get_user_tokens(self, user_address):
        event_signature_hash = self.w3Util.keccak_hex("Archived(address,uint256,string)")
        checksum_address = Web3Util.to_checksum_address(self.contract_address)
        event_filter = {
            "fromBlock": 'earliest',
            "toBlock": 'latest',
            "address": checksum_address,
            "topics": [event_signature_hash,self.w3Util.address_encode_abi_hex(user_address)],
        }
        events = self.w3Util.filter_events(event_filter).get_all_entries()
        print('Evnet:'+str(events))
        tokens = []
        for event in events:
            tokens.append(self.get_identifier(event))
        return tokens

    def get_identifier(self, event):
        receipt = self.w3Util.get_transaction_receipt(event)
        print('receipt:'+str(receipt))
        event_sign = self.contract.events['Archived']()
        print('event_sign:'+str(event_sign))
        result = event_sign.processReceipt(receipt, web3.logs.DISCARD)
        token = result[0]['args']['token']
        ipfs_hash = result[0]['args']['identifier']
        return {'token': token, 'hash': ipfs_hash}


