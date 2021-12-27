import ipfshttpclient
from common_utils import *


class IpfsClient:
    _api = None

    def __init__(self, multiaddr, stage_dir):
        self._api = self._connect(multiaddr)
        self.stage_dir = stage_dir

    def _connect(self, multiaddr):
        return ipfshttpclient.connect(multiaddr)

    def add(self, filename, content):
        if not isNone(content):
            file_path = create_file(self.stage_dir, filename, content)
            return self._api.add(file_path)
        else:
            raise Exception("Content cannot be null")

    def add_file(self, file, filename):
        if not isNone(file):
            file_path = self.stage_dir + '/' + filename
            file.save(file_path)
            return self._api.add(file_path)
        else:
            raise Exception("File cannot be null")

    def get(self, cid, stage_dir):
        if isNone(cid):
            raise "CID can not be null"

        return self._api.get(cid, stage_dir)
