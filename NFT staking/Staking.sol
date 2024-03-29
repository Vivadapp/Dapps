// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


import "./Minting_NFT.sol";
import "./Minting_ERC20.sol";

contract NFT_Staking {

    uint totalStaked; //Number of staked NFTs in this contract

    //represents an NFT which has been staked
    struct Staking {
        uint24 tokenId;
        uint48 stakingStartTime;
        address owner;
    }

    mapping(uint => Staking) NFTsStaked;

    uint rewardsPerHour = 10000; //Number of ERC20 tokens earned by hours per staked NFT

    ERC20_Minting token;
    NFT_Minting nft;

    event Staked(address indexed owner, uint tokenId, uint value);
    event Unstaked(address indexed owner, uint tokenId, uint value);
    event Claimed(address indexed owner, uint amount);

    constructor(ERC20_Minting _token, NFT_Minting _nft) {
        token = _token;
        nft = _nft;
    }

    function Stake(uint[] calldata tokenIds) external {
        uint tokenId;
        totalStaked += tokenIds.length;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
            require(NFTsStaked[tokenId].stakingStartTime == 0, "Already Staked");

            nft.transferFrom(msg.sender, address(this), tokenId);
            emit Staked(msg.sender, tokenId, block.timestamp);

            NFTsStaked[tokenId] = Staking({
                tokenId: uint24(tokenId),
                stakingStartTime: uint48(block.timestamp),
                owner: msg.sender
            });
        }
    }

    function _unstakeMany(address owner, uint[] calldata tokenIds) internal {
        uint tokenId;
        totalStaked -= tokenIds.length;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(NFTsStaked[tokenId].owner == msg.sender, "Not the owner");

            emit Unstaked(owner, tokenId, block.timestamp);
            delete NFTsStaked[tokenId];

            nft.transferFrom(address(this), owner, tokenId);
        }
    }

    function claim(uint[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, false);
    }

    function unstake(uint[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, true);
    }

    function _claim(address owner, uint[] calldata tokenIds, bool _unstake) internal {
        uint tokenId;
        uint earned;
        uint totalEarned;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            Staking memory thisStake = NFTsStaked[tokenId];
            require(thisStake.owner == owner, "Not the owner, you can not claim the awards");

            uint stakingStartTime = thisStake.stakingStartTime;

            earned = ((block.timestamp - stakingStartTime) * rewardsPerHour) / 3600;
            totalEarned += earned;

            NFTsStaked[tokenId] = Staking({
                tokenId: uint24(tokenId),
                stakingStartTime: uint48(block.timestamp),
                owner: owner
            });
        }

        if(totalEarned > 0) {
            token.mint(owner, totalEarned);
        }
        if(_unstake) {
            _unstakeMany(owner, tokenIds);
        }
        emit Claimed(owner, totalEarned);
    }

    
    function getRewardAmount(address owner, uint[] calldata tokenIds) external view returns(uint) {

        uint tokenId;
        uint earned;
        uint totalEarned;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            Staking memory thisStake = NFTsStaked[tokenId];
            require(thisStake.owner == owner, "Not the owner, you can not claim the awards");

             uint stakingStartTime = thisStake.stakingStartTime;

            earned = ((block.timestamp - stakingStartTime) * rewardsPerHour) / 3600;
            totalEarned += earned;
        }
        return totalEarned;
    }

    function tokenStakedByOwner(address owner) external view returns(uint[] memory) {
        uint totalSupply = nft.totalSupply();
        uint[] memory tmp = new uint[](totalSupply);
        uint index = 0;

        for(uint i = 0; i < totalSupply; i++) {
            if(NFTsStaked[i].owner == owner) {
                tmp[index] = i;
                index++;
            }
        }

        uint[] memory tokens = new uint[](index);
        for(uint i = 0; i < index; i++) {
            tokens[i] = tmp[i];
        }
        return tokens;
    }

}