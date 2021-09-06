pragma solidity ^0.5.0;

contract Deed {
  address public lawyer;
  address payable public beneficiary;
  uint public earliest;
  uint public amount;

  constructor(
    address _lawyer, 
    address payable _beneficiary, 
    uint _amount,
    uint fromNow) 
    payable 
    public {
    lawyer = _lawyer;
    beneficiary = _beneficiary;
    amount = _amount;
    earliest = now + fromNow;
  }

  function withdraw() public {
    require(msg.sender == lawyer, 'lawyer only');
    require(now >= earliest, 'too early');
    beneficiary.transfer(address(this).balance);
  }
}
