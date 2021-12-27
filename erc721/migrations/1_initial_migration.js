const ERC721 = artifacts.require("ERC721");

module.exports = function (deployer) {
  deployer.deploy(ERC721,'ERC721','XOXO');
};
