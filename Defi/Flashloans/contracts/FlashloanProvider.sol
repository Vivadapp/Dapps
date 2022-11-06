pragma solidity ^0.7.3;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './IFlashloanUser.sol';

contract FlashloanProvider is ReentrancyGuard {
  mapping(address => IERC20) public tokens; //keep track of the different tokens we can lend

  constructor(address[] memory _tokens) {
    for(uint i = 0; i < _tokens.length; i++) {
      tokens[_tokens[i]] = IERC20(_tokens[i]);
    }
  }

  function executeFlashloan(
    address callback, //address where we need to send the token
    uint amount, //amount of token that is lent
    address _token, //address of the token
    bytes memory data //arbitrary data that we are going to forward to the borrower
  ) 
    nonReentrant()
    external 
  {
    IERC20 token = tokens[_token]; //pointer to the token we are going to lend
    uint originalBalance = token.balanceOf(address(this));
    require(address(token) != address(0), 'token not supported'); //check if the token is available  
    require(originalBalance >= amount, 'amount too high');

    token.transfer(callback, amount);
    IFlashloanUser(callback).flashloanCallback(amount, _token, data); //pointer to the borrower
    require(
      token.balanceOf(address(this)) == originalBalance, 
      'flashloan not reimbursed'
    );
  }
}
