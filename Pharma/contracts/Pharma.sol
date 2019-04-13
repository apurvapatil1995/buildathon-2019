pragma solidity >=0.4.22 <0.6.0;
contract Pharma{

    constructor() public{
    }

    struct product {
        uint productID;
        address currOwn;
        address prevOwn;
    }
    mapping(uint => product) products;

    function create(uint productID, uint serialNo) public {
        products[serialNo].productID = productID;
        products[serialNo].currOwn = msg.sender;
        products[serialNo].prevOwn = msg.sender;
    }

    function transact(address receiver, uint serialNo) public {
        //require(products[serialNo].currOwn == msg.sender, "You don't own this");
        products[serialNo].prevOwn = msg.sender;
        products[serialNo].currOwn = receiver;
    }



}
