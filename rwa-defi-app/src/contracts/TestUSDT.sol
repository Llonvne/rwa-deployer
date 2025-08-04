// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TestUSDT
 * @dev A test USDT contract for Sepolia testnet
 * This contract mimics USDT functionality for testing purposes
 */
contract TestUSDT {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string public name = "Test USD Tether";
    string public symbol = "TUSDT";
    uint8 public decimals = 6;
    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "TestUSDT: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Mint initial supply of 1,000,000 TUSDT to deployer
        uint256 initialSupply = 1000000 * 10**decimals;
        _totalSupply = initialSupply;
        _balances[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Mint new tokens (only owner)
     * Useful for testing - users can request test tokens
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "TestUSDT: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
        emit Mint(to, amount);
    }

    /**
     * @dev Faucet function - anyone can mint test tokens for themselves
     * Limited to 1000 TUSDT per call to prevent abuse
     */
    function faucet() public {
        uint256 faucetAmount = 1000 * 10**decimals; // 1000 TUSDT
        require(_balances[msg.sender] < faucetAmount * 10, "TestUSDT: you already have enough test tokens");
        
        _totalSupply += faucetAmount;
        _balances[msg.sender] += faucetAmount;
        emit Transfer(address(0), msg.sender, faucetAmount);
        emit Mint(msg.sender, faucetAmount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "TestUSDT: transfer from the zero address");
        require(to != address(0), "TestUSDT: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "TestUSDT: transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "TestUSDT: approve from the zero address");
        require(spender != address(0), "TestUSDT: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "TestUSDT: insufficient allowance");
            _approve(owner, spender, currentAllowance - amount);
        }
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "TestUSDT: new owner is the zero address");
        owner = newOwner;
    }
}