const NFTokenReceiverTestMock = artifacts.require("NFTokenReceiverTestMock");

module.exports = function (deployer) {
  deployer.deploy(NFTokenReceiverTestMock);
};
