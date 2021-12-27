import web3.logs
import Web3Util
from Web3Util import Web3Util


class ArchiverEthHandler:
    def __init__(self, url, address , abi_file):
        self.w3Util = Web3Util(url)
        self.address = address
        self.contract = self.w3Util.load_contract(self.address,abi_file)

    def get_user_ipfs_cid(self, user_address):
        event_signature_hash = self.w3Util.keccak_hex("Archived(address,string)")
        checksum_address = Web3Util.to_checksum_address(self.address)
        event_filter = {
            "fromBlock": 'earliest',
            "toBlock": 'latest',
            "address": checksum_address,
            "topics": [event_signature_hash,self.w3Util.address_encode_abi_hex(user_address)],
        }
        events = self.w3Util.filter_events(event_filter).get_all_entries()
        cdis = []
        for event in events:
            cdis.append(self.get_identifier(event))
        return cdis

    def get_identifier(self, event):
        receipt = self.w3Util.get_transaction_receipt(event)
        result = self.contract.events['Archived']().processReceipt(receipt, web3.logs.STRICT)
        return result[0]['args']['identifier']

    def archive(self, ipfs_cid, privateKey, gas):
        txn = self.contract.functions.archive(ipfs_cid).buildTransaction()
        txn.update({'gas': gas})
        account = self.w3Util.account_from_pk(privateKey)
        txn.update({'nonce': self.w3Util.get_transaction_count(account.address)})
        signed = self.w3Util.sign_transaction(txn, privateKey)
        txn_hash = self.w3Util.send_raw_transaction(signed.rawTransaction)


