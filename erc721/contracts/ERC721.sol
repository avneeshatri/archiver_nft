pragma solidity ^0.8.0;

import "./IERC721.sol";
import "./IERC721Metadata.sol";
import "./IERC165.sol";
import "./IERC721Receiver.sol";

//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol

contract ERC721 is IERC721 , IERC721Metadata , IERC165 {
    

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    mapping(bytes4 => bool) private _supportedInterfaces ;

    uint256 private _tokenIdCounter ;

    string private _name;
    string private _symbol;
    mapping(address => uint256[]) _holderTokens ;
    mapping(uint256 => address) _tokenOwners;
    mapping (uint256 => string) private _tokenURIs;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(string => uint8) hashes;

    constructor (string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _tokenIdCounter = 0;
        /* register the supported interfaces to conform to ERC721 via ERC165 */
      /*  _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
        _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE); */
    }

    function currentTokenCounter() internal view returns (uint256){
        return _tokenIdCounter;
    }

    function incrementTokenCounter() internal {
        _tokenIdCounter = _tokenIdCounter + 1;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "ERC721: balance query for the zero address");
        return _holderTokens[owner].length;
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return _tokenOwners[tokenId];
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
   //     require(_exists(tokenId), string(abi.encodePacked("ERC721Metadata: URI query for nonexistent token:",tokenId )));
        return _tokenURIs[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokenOwners[tokenId] != address(0);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual { }

    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ERC721.ownerOf(tokenId), to, tokenId); // internal owner
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        private returns (bool)
    {
        if (!isContract(to)) {
            return true;
        }


        (bool success, bytes memory returndata) = _functionCall(to , abi.encodeWithSelector(
            IERC721Receiver(to).onERC721Received.selector,
            msg.sender,
            from,
            tokenId,
            _data
        ) , 0);
        require(success,'Contract verification call failed ');
        bytes4 retval = abi.decode(returndata, (bytes4));
        return (retval == _ERC721_RECEIVED);
    }

    function _functionCall(address target, bytes memory data , uint256 value) private returns (bool success,bytes memory returndata){
        return target.call{ value: value }(data);
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own"); // internal owner
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        require(_removeHolderToken(from,tokenId),"Token not found") ;
        _holderTokens[to].push(tokenId);

        _tokenOwners[tokenId]= to;

        emit Transfer(from, to, tokenId);
    }


    function _removeHolderToken(address from, uint256  tokenId) private returns (bool){
        uint256 noOfTokens = _holderTokens[from].length;
        uint256 toDeleteIndex =  noOfTokens;
        uint256 lastIndex = noOfTokens- 1 ;

        for(uint i = 0 ; i < noOfTokens; i++){
            if(_holderTokens[from][i] == tokenId){
                toDeleteIndex = i;
                break ;
            }
        }

        if(toDeleteIndex < noOfTokens){
            _holderTokens[from][toDeleteIndex] = _holderTokens[from][lastIndex];
            _holderTokens[from].pop();
            return true;
        }

        return false;
    }

    function approve(address to, uint256 tokenId) public virtual override payable {
        address owner = ERC721.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(msg.sender == owner || ERC721.isApprovedForAll(owner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");

        return _tokenApprovals[tokenId];
    }

     function setApprovalForAll(address operator, bool approved) public virtual override {
        require(operator != _msgSender(), "ERC721: approve to caller");

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function _msgSender() view private returns  (address){
        return msg.sender ;
    }

    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

        /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override payable{
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override payable {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override payable {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

      function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal virtual {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ERC721.ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || ERC721.isApprovedForAll(owner, spender));
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return _supportedInterfaces[interfaceId];
    }

        /**
     * @dev Registers the contract as an implementer of the interface defined by
     * `interfaceId`. Support of the actual ERC165 interface is automatic and
     * registering its interface id is not required.
     *
     * See {IERC165-supportsInterface}.
     *
     * Requirements:
     *
     * - `interfaceId` cannot be the ERC165 invalid interface (`0xffffffff`).
     */
    function _registerInterface(bytes4 interfaceId) internal virtual {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }

    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    function mintToken(address recipient, string memory hash, string memory metadata) public returns (uint256)
    {
        require(hashes[hash] != 1);
        hashes[hash] = 1;
        incrementTokenCounter();
        uint256 newItemId = currentTokenCounter();
        _safeMint(recipient, newItemId ,"");
        _tokenURIs[newItemId] = metadata;
        return newItemId;
    }

    function _safeMint(address to, uint256 tokenId, bytes memory _data) internal virtual {
        _mint(to, tokenId);
        require(_checkOnERC721Received(address(0), to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), string(abi.encodePacked("ERC721: token already minted :" ,tokenId)));

        _beforeTokenTransfer(address(0), to, tokenId);

        _holderTokens[to].push(tokenId);

        _tokenOwners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function safeBurn(uint256 tokenId) public virtual {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        _burn(tokenId);
        require(!_exists(tokenId), "Token not burnt");
    }

    function _burn(uint256 tokenId) internal virtual {
        address owner = ERC721.ownerOf(tokenId); // internal owner

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        // Clear metadata (if any)
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }

        _removeHolderToken(owner,tokenId);

        delete _tokenOwners[tokenId] ;

        emit Transfer(owner, address(0), tokenId);
    }
}