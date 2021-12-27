from ArchiverIpfsHandler import ArchiverIpfsHandler
from common_utils import load_properties
from ArchiverEthHandler import ArchiverEthHandler
from GalleryErc721EthHandler import GalleryErc721EthHandler


class ArchiverService:

    def __init__(self, props_file):
        self.props = load_properties(props_file)
        self.ipfsArchiver = ArchiverIpfsHandler(self.props.get('ipfs.multiaddr'), self.props.get('ipfs.staging.dir'))
        self.ethArchiver = ArchiverEthHandler(self.props.get('eth.network.url'),self.props.get('eth.contract.address'), self.props.get('eth.contract.abi'))
        self.ethGallery = GalleryErc721EthHandler(self.props.get('eth.network.url'),self.props.get('eth.gallery.contract.address'), self.props.get('eth.gallery.contract.privateKey'), self.props.get('eth.gallery.contract.abi'),int(self.props.get('eth.gallery.contract.gas')))

    def add_to_ipfs(self, user, file):
        print("adding file to ipfs for :" + user)
        return self.ipfsArchiver.add_user_file_to_ipfs(user, file)

    def get_user_cids(self, user_address):
        print("getting ipfs cids for :"+user_address)
        cids = self.ethArchiver.get_user_ipfs_cid(user_address)
        print("user cids:"+str(cids))
        return cids

    def mint_token(self, user_address, hash, ifpsUrl):
        self.ethGallery.mint(user_address,hash,ifpsUrl)

    def get_user_tokens(self,user_address):
        return self.ethGallery.get_user_tokens(user_address)

    def user_token_balance(self,user):
        return self.ethGallery.balanceOf(user)
    