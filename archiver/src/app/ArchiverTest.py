from ArchiverEthHandler import ArchiverEthHandler


def main():
    abi_file = '/home/atri/workspace_ethereum/ethapp/archiver/src/output/Archiver.abi'
    url = 'http://127.0.0.1:7545'
    contract_address = '0x3270A5a45DB6d3b0333C2967730Ba87352effbD5'
    user_address = '0xE1a27103bff937F44c4a4aD94216D18270839926'
    handler = ArchiverEthHandler(url, contract_address, abi_file)
    privateKey = "0a3dc15fc285d4016a9e5b13d73d9b38b3232aa1a7a2d5ca97e14d9d3b3b8b99"
    handler.archive("dummy_hash",privateKey,24967)
    print(handler.get_user_ipfs_cid(user_address))



if __name__ == "__main__":
    main()
