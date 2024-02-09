// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LikeEmitter is Ownable {
    uint256 public likeFee;

    event Like(address indexed collectionAddress, uint256 tokenId);

    constructor(uint256 _likeFee) {
        likeFee = _likeFee;
        _transferOwnership(msg.sender);
    }

    function like(address collectionAddress, uint256 tokenId) external payable {
        require(msg.value >= likeFee, "LikeEmitter: insufficient fee");
        emit Like(collectionAddress, tokenId);
    }

    function setLikeFee(uint256 _newLikeFee) external onlyOwner {
        likeFee = _newLikeFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}