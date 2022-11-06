pragma solidity ^0.7.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

//permet de créer un token ERC20
contract TokenOpenZeppelin1 is ERC20 { 
  constructor() ERC20('Token Name', 'TOKEN_SYMBOL') public {}
}

//with allocation in constructor
//permet de créer un token ERC20 avec 100000 exemplaires grace à un constructor
contract TokenOpenZeppelin2 is ERC20 { 
  constructor() ERC20('Token Name', 'TOKEN_SYMBOL') {
    _mint(msg.sender, 100000);
  }
}

//with allocation in mint() function
//permet de créer un token ERC20 avec 100000 exemplaires grace à une fonction
contract TokenOpenZeppelin3 is ERC20 { 
  address public admin;

  constructor() ERC20('Token Name', 'TOKEN_SYMBOL') public {
    admin = msg.sender;
  }

  function mint(address to, uint amount) external {
    require(msg.sender == admin, 'only admin');
    _mint(to, amount);
  }
}

//with faucet (good for testing)
contract TokenOpenZeppelin4 is ERC20 { 
  constructor() ERC20('Token Name', 'TOKEN_SYMBOL') public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}
