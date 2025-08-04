// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title RWAToken
 * @dev ERC20 token contract for Real World Asset tokenization
 * Features:
 * - Standard ERC20 functionality
 * - Minting and burning capabilities
 * - Ownership control
 * - Pausing mechanism for emergency situations
 * - Asset metadata tracking
 * - Enhanced transfer validation and error handling
 */
contract RWAToken is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    
    address public owner;
    address public factory;
    bool public paused;
    
    // RWA specific metadata
    string public assetType;
    string public assetLocation;
    string public legalDocumentHash;
    uint256 public assetValue; // Value in USD cents
    bool public verified;
    
    // Enhanced events for better tracking
    event AssetVerified(address indexed verifier);
    event AssetUpdated(string newAssetType, uint256 newAssetValue);
    event TokenPaused(address indexed pauser);
    event TokenUnpaused(address indexed unpauser);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Custom errors for better gas efficiency
    error InsufficientBalance(address account, uint256 requested, uint256 available);
    error InsufficientAllowance(address owner, address spender, uint256 requested, uint256 available);
    error TransferToZeroAddress();
    error TransferFromZeroAddress();
    error ApproveToZeroAddress();
    error ApproveFromZeroAddress();
    error TokenPausedError();
    error NotOwner();
    error NotFactory();
    error InvalidAmount();
    error InvalidAddress();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert TokenPausedError();
        _;
    }
    
    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }
    
    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner,
        string memory _assetType,
        string memory _assetLocation,
        uint256 _assetValue
    ) validAddress(_owner) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = _owner;
        factory = msg.sender;
        assetType = _assetType;
        assetLocation = _assetLocation;
        assetValue = _assetValue;
        
        _totalSupply = _initialSupply * 10**decimals;
        _balances[_owner] = _totalSupply;
        emit Transfer(address(0), _owner, _totalSupply);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused validAmount(amount) validAddress(to) returns (bool) {
        address from = msg.sender;
        _transfer(from, to, amount);
        return true;
    }
    
    function allowance(address ownerAddr, address spender) public view override returns (uint256) {
        return _allowances[ownerAddr][spender];
    }
    
    function approve(address spender, uint256 amount) public override validAddress(spender) returns (bool) {
        address ownerAddr = msg.sender;
        _approve(ownerAddr, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused validAmount(amount) validAddress(to) validAddress(from) returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) public onlyOwner validAddress(to) validAmount(amount) {
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
        emit TokensMinted(to, amount);
    }
    
    function burn(uint256 amount) public validAmount(amount) {
        address account = msg.sender;
        uint256 accountBalance = _balances[account];
        if (accountBalance < amount) {
            revert InsufficientBalance(account, amount, accountBalance);
        }
        
        _balances[account] = accountBalance - amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
        emit TokensBurned(account, amount);
    }
    
    function burnFrom(address account, uint256 amount) public validAmount(amount) validAddress(account) {
        _spendAllowance(account, msg.sender, amount);
        uint256 accountBalance = _balances[account];
        if (accountBalance < amount) {
            revert InsufficientBalance(account, amount, accountBalance);
        }
        
        _balances[account] = accountBalance - amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
        emit TokensBurned(account, amount);
    }
    
    function pause() public onlyOwner {
        paused = true;
        emit TokenPaused(msg.sender);
    }
    
    function unpause() public onlyOwner {
        paused = false;
        emit TokenUnpaused(msg.sender);
    }
    
    function verifyAsset() public onlyFactory {
        verified = true;
        emit AssetVerified(msg.sender);
    }
    
    function updateAssetInfo(
        string memory _assetType,
        uint256 _assetValue,
        string memory _legalDocumentHash
    ) public onlyOwner {
        assetType = _assetType;
        assetValue = _assetValue;
        legalDocumentHash = _legalDocumentHash;
        emit AssetUpdated(_assetType, _assetValue);
    }
    
    function transferOwnership(address newOwner) public onlyOwner validAddress(newOwner) {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        uint256 fromBalance = _balances[from];
        if (fromBalance < amount) {
            revert InsufficientBalance(from, amount, fromBalance);
        }
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address ownerAddr, address spender, uint256 amount) internal {
        _allowances[ownerAddr][spender] = amount;
        emit Approval(ownerAddr, spender, amount);
    }
    
    function _spendAllowance(address ownerAddr, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(ownerAddr, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) {
                revert InsufficientAllowance(ownerAddr, spender, amount, currentAllowance);
            }
            _approve(ownerAddr, spender, currentAllowance - amount);
        }
    }
    
    // Enhanced view functions for asset information
    function getAssetInfo() public view returns (
        string memory _assetType,
        string memory _assetLocation,
        uint256 _assetValue,
        bool _verified,
        string memory _legalDocumentHash
    ) {
        return (assetType, assetLocation, assetValue, verified, legalDocumentHash);
    }
    
    // Additional utility functions
    function getTokenInfo() public view returns (
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner,
        bool _paused
    ) {
        return (name, symbol, decimals, _totalSupply, owner, paused);
    }
    
    // Function to get formatted balance with decimals
    function getFormattedBalance(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    // Function to check if an address has sufficient balance
    function hasSufficientBalance(address account, uint256 amount) public view returns (bool) {
        return _balances[account] >= amount;
    }
}