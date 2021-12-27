const ERC721 = artifacts.require("GalleryERC721");

module.exports = function (deployer) {
  deployer.deploy(ERC721,'GalleryERC721','XOXO');
};
