const Archiver = artifacts.require("Archiver");

module.exports = function (deployer) {
  deployer.deploy(Archiver);
};
