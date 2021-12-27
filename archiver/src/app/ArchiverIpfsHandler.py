import time
from IpfsClient import IpfsClient

class ArchiverIpfsHandler:

    def __init__(self, multiaddr, stage_dir):
        self.ipfs = IpfsClient(multiaddr, stage_dir)

    def add_user_file_to_ipfs(self, user, content):
        suffix = time.time()
        filename = user + "_" + str(suffix)
        return self.ipfs.add(filename,content)

    def get_user_file_from_ipfs(self,cid,stage_dir):
        return self.ipfs.get(cid,stage_dir)

    def add_user_content_to_ipfs(self, user, content):
        suffix = time.time()
        filename = user + "_" + str(suffix)
        return self.ipfs.add(filename,content)

    def add_user_file_to_ipfs(self, user, file):
        suffix = time.time()
        filename = user + "_" + str(suffix)
        resposne = self.ipfs.add_file(file,filename)
        print(resposne)
        return resposne['Hash']


