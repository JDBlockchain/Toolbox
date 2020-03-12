pragma solidity ^0.4.24;

contract simplestorage {
  uint public storedData;

  constructor(uint initVal) public {
    storedData = initVal;
  }

  function set(uint x) public {
    storedData = x;
  }

  function add(uint x) public {
    storedData = storedData + x;
  }

  function get() view public returns (uint retVal) {
    return storedData;
  }
}
