pragma solidity ^0.7.3;

contract Oracle {
  struct Data {
    uint date; //date when we report the payload
    uint payload; // actual data
  }
  address public admin;
  mapping(address => bool) public reporters; //the reporters are addresses which are allowed to report the data
  mapping(bytes32 => Data) public data; //is used to store the reported data

  constructor(address _admin) {
    admin = _admin;
  }

  function updateReporter(address reporter, bool isReporter) external {
    require(msg.sender == admin, 'only admin');
    reporters[reporter] = isReporter;
  }

  function updateData(bytes32 key, uint payload) external {
    require(reporters[msg.sender] == true, 'only reporters');
    data[key] = Data(block.timestamp, payload); 
  }

  function getData(bytes32 key) 
    external 
    view 
    returns(bool result, uint date, uint payload) {
    if(data[key].date == 0) {
      return (false, 0, 0);
    }
    return (true, data[key].date, data[key].payload);
  }
}
