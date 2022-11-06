//token transfer between different smart contracts
pragma solidity ^0.7.3;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface ContractB {
  function deposit(uint amount) external;
  function withdraw(uint amount) external;
}

contract ContractA {
  //pointer toward the token
  IERC20 public token;
  //Pointer toward contract B
  ContractB public contractB;

  constructor(address _token, address _contractB) {
    //grace à la token variable on peut intéragir avec le token contract
    token = IERC20(_token);
    contractB = ContractB(_contractB); 
  }

  //First deposit token in contract A and then in contract B
  function deposit(uint amount) external {
    token.transferFrom(msg.sender, address(this), amount);
    token.approve(address(contractB), amount);
    contractB.deposit(amount);
  }

  //send back the tokens to the original owner
  function withdraw(uint amount) external {
    contractB.withdraw(amount);
    token.transfer(msg.sender, amount);
  }
}
