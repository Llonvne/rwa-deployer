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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "RWAToken: caller is not the owner");
        _;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "RWAToken: caller is not the factory");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "RWAToken: token transfers are paused");
        _;
    }
    
    event AssetVerified(address indexed verifier);
    event AssetUpdated(string newAssetType, uint256 newAssetValue);
    event TokenPaused(address indexed pauser);
    event TokenUnpaused(address indexed unpauser);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner,
        string memory _assetType,
        string memory _assetLocation,
        uint256 _assetValue
    ) {
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
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "RWAToken: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function burn(uint256 amount) public {
        address account = msg.sender;
        require(_balances[account] >= amount, "RWAToken: burn amount exceeds balance");
        
        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
    
    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        require(_balances[account] >= amount, "RWAToken: burn amount exceeds balance");
        
        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
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
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "RWAToken: new owner is the zero address");
        owner = newOwner;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "RWAToken: transfer from the zero address");
        require(to != address(0), "RWAToken: transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "RWAToken: transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "RWAToken: approve from the zero address");
        require(spender != address(0), "RWAToken: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "RWAToken: insufficient allowance");
            _approve(owner, spender, currentAllowance - amount);
        }
    }
    
    // View functions for asset information
    function getAssetInfo() public view returns (
        string memory _assetType,
        string memory _assetLocation,
        uint256 _assetValue,
        bool _verified,
        string memory _legalDocumentHash
    ) {
        return (assetType, assetLocation, assetValue, verified, legalDocumentHash);
    }
}