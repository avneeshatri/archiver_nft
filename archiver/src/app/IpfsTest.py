from ArchiverIpfsHandler import ArchiverIpfsHandler

def main():
    multiaddr = "/ip4/127.0.0.1/tcp/5001"
    stage_dir = '/home/atri/workspace_ethereum/ethapp/archiver/.staging'
    archiverIpfs = ArchiverIpfsHandler(multiaddr,stage_dir)
    content = "This is sample text\n This is sample text line 2"
    user = "0xE1a27103bff937F44c4a4aD94216D18270839926"
    cid = 'QmeHfDkajxQ8zeyuJSSeVz5VNrS5u83FXX6Xp959z7MiiL'
   # ipfs_resposne = archiverIpfs.add_user_content_to_ipfs(user, content)
    #print(ipfs_resposne)
    archiverIpfs.get_user_file_from_ipfs(cid,stage_dir)




if __name__ == "__main__":
    main()