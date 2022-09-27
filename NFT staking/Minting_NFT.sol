// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;



import "https://github.com/chiru-labs/ERC721A/blob/main/contracts/extensions/ERC721AQueryable.sol";

contract NFT_Minting is ERC721A, ERC721AQueryable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function mint(uint256 quantity) external payable {
        _safeMint(msg.sender, quantity);
    }
}

