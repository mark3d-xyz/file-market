// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LikeEmitter {
    event Like(address indexed collectionAddress, uint256 tokenId);

    function like(address collectionAddress, uint256 tokenId) external {
        emit Like(collectionAddress, tokenId);
    }
}