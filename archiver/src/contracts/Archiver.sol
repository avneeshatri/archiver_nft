pragma solidity ^0.8.3;

contract Archiver {

    event Archived (address indexed user,string identifier);

    function archive(string memory identifier) public {
        emit Archived(msg.sender, identifier);
    }
}
