from web3 import Web3
import json
from eth_abi import encode_abi
from eth_abi import decode_abi
from eth_account import Account


class Web3Util:
    def __init__(self, url):
        self.w3 = Web3Util.get_web3_client(url)

    @staticmethod
    def get_web3_client(url):
        return Web3(Web3.HTTPProvider(url))

    @staticmethod
    def to_checksum_address(address):
        return Web3.toChecksumAddress(address)

    def load_contract(self, address, abi_file):
        with open(abi_file) as json_file:
            abi = json.load(json_file)
        contract_instance = self.w3.eth.contract(address=address, abi=abi)
        return contract_instance

    def filter_events(self, event_filter):
        return self.w3.eth.filter(event_filter)

    def address_encode_abi_hex(self, address):
        return self.w3.toHex(encode_abi(["address"], [address]))

    def data_decode_abi(self, type, data):
        return decode_abi([type], bytes(data))

    def keccak_hex(self, text):
        return self.w3.keccak(text=text).hex()

    def get_transaction_receipt(self,event):
        return self.w3.eth.waitForTransactionReceipt(event['transactionHash'])

    def account_from_pk(self, private_key):
        return Account.from_key(private_key)

    def get_transaction_count(self,address):
        return self.w3.eth.get_transaction_count(address)

    def sign_transaction(self, txn, privateKey):
        return self.w3.eth.account.signTransaction(txn, privateKey)

    def send_raw_transaction(self, raw_txn):
        return self.w3.eth.sendRawTransaction(raw_txn)

