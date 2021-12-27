pragma solidity ^0.8.0;

import "./erc721/ERC721.sol";

contract GalleryERC721 is ERC721 {

    event Archived (address indexed user,uint256 token,string identifier);

    constructor(string memory name_, string memory symbol_) ERC721(name_,symbol_){
    }

    function executeMintIfSignatureMatch(
        uint8 v,
        bytes32 r,
        bytes32 s,
        address sender,
        uint256 deadline,
        string memory ipfs_hash,
        string memory ipfs_url
    ) external returns (uint256){
        require(block.timestamp < deadline, "Signed transaction expired");

        uint chainId =1337;
       /* assembly {
            chainId := chainid()
        }*/

        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("GalleryERC721")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );  

        bytes32 hashStruct = keccak256(
        abi.encode(
            keccak256("set(address sender,string ipfs_hash,string ipfs_url,uint deadline)"),
            sender,
            keccak256(bytes(ipfs_hash)),
            keccak256(bytes(ipfs_url)),
            deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");
        require(signer == sender, "Singnature Faliure: invalid signature");
        

        return mintToken(signer,ipfs_hash,ipfs_url);
  
    }


    function mintToken(address recipient, string memory hash, string memory metadata) public returns (uint256)
    {
        require(hashes[hash] != 1);
        hashes[hash] = 1;
        incrementTokenCounter();
        uint256 newItemId = currentTokenCounter();
        _safeMint(recipient, newItemId ,"");
        tokenURI(newItemId,metadata);
        emit Archived(recipient,newItemId,hash);
        return newItemId;
    }
}