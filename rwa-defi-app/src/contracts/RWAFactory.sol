// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RWAToken.sol";

/**
 * @title RWAFactory
 * @dev Factory contract for creating and managing RWA tokens
 * Features:
 * - Deploy new RWA tokens
 * - Track all deployed tokens
 * - Administrative controls
 * - Fee collection mechanism
 * - Verification system
 * - Enhanced error handling and validation
 */
contract RWAFactory {
    address public owner;
    address public feeCollector;
    uint256 public deploymentFee; // Fee in wei
    bool public paused;
    
    // Mapping from token address to deployment info
    mapping(address => TokenInfo) public tokenInfo;
    // Array of all deployed token addresses
    address[] public deployedTokens;
    // Mapping from deployer to their tokens
    mapping(address => address[]) public deployerTokens;
    // Mapping from category to token addresses
    mapping(string => address[]) public categoryTokens;
    
    struct TokenInfo {
        address deployer;
        string name;
        string symbol;
        uint256 deploymentTime;
        bool verified;
        string category; // e.g., "Real Estate", "Commodities", "Art", etc.
        uint256 deploymentFee;
    }
    
    // Enhanced events
    event TokenDeployed(
        address indexed tokenAddress,
        address indexed deployer,
        string name,
        string symbol,
        string category,
        uint256 deploymentFee
    );
    event TokenVerified(address indexed tokenAddress, address indexed verifier);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FactoryPaused(address indexed pauser);
    event FactoryUnpaused(address indexed unpauser);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Custom errors for better gas efficiency
    error NotOwner();
    error FactoryPausedError();
    error InsufficientFee(uint256 provided, uint256 required);
    error InvalidTokenName();
    error InvalidTokenSymbol();
    error InvalidInitialSupply();
    error InvalidAddress();
    error TokenAlreadyVerified();
    error TokenNotFound();
    error InvalidFee();
    error InvalidFeeCollector();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert FactoryPausedError();
        _;
    }
    
    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }
    
    modifier validString(string memory str) {
        if (bytes(str).length == 0) revert InvalidTokenName();
        _;
    }
    
    modifier validSupply(uint256 supply) {
        if (supply == 0) revert InvalidInitialSupply();
        _;
    }
    
    constructor(uint256 _deploymentFee) {
        owner = msg.sender;
        feeCollector = msg.sender;
        deploymentFee = _deploymentFee;
    }
    
    /**
     * @dev Deploy a new RWA token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Token decimals
     * @param _initialSupply Initial token supply
     * @param _assetType Type of the underlying asset
     * @param _assetLocation Location of the asset
     * @param _assetValue Value of the asset in USD cents
     * @param _category Category of the RWA (e.g., "Real Estate")
     */
    function deployRWAToken(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        string memory _assetType,
        string memory _assetLocation,
        uint256 _assetValue,
        string memory _category
    ) external payable whenNotPaused validString(_name) validString(_symbol) validSupply(_initialSupply) returns (address) {
        if (msg.value < deploymentFee) {
            revert InsufficientFee(msg.value, deploymentFee);
        }
        
        // Deploy new RWA token
        RWAToken newToken = new RWAToken(
            _name,
            _symbol,
            _decimals,
            _initialSupply,
            msg.sender, // Token owner
            _assetType,
            _assetLocation,
            _assetValue
        );
        
        address tokenAddress = address(newToken);
        
        // Store token information
        tokenInfo[tokenAddress] = TokenInfo({
            deployer: msg.sender,
            name: _name,
            symbol: _symbol,
            deploymentTime: block.timestamp,
            verified: false,
            category: _category,
            deploymentFee: msg.value
        });
        
        // Track deployed tokens
        deployedTokens.push(tokenAddress);
        deployerTokens[msg.sender].push(tokenAddress);
        categoryTokens[_category].push(tokenAddress);
        
        // Transfer deployment fee to fee collector
        if (deploymentFee > 0) {
            payable(feeCollector).transfer(deploymentFee);
        }
        
        // Refund excess payment
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit TokenDeployed(tokenAddress, msg.sender, _name, _symbol, _category, msg.value);
        
        return tokenAddress;
    }
    
    /**
     * @dev Verify a deployed RWA token (only owner)
     */
    function verifyToken(address _tokenAddress) external onlyOwner validAddress(_tokenAddress) {
        TokenInfo storage info = tokenInfo[_tokenAddress];
        if (info.deployer == address(0)) {
            revert TokenNotFound();
        }
        if (info.verified) {
            revert TokenAlreadyVerified();
        }
        
        info.verified = true;
        
        // Call verify function on the token contract
        RWAToken(_tokenAddress).verifyAsset();
        
        emit TokenVerified(_tokenAddress, msg.sender);
    }
    
    /**
     * @dev Get all deployed tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return deployedTokens;
    }
    
    /**
     * @dev Get tokens deployed by a specific address
     */
    function getTokensByDeployer(address _deployer) external view validAddress(_deployer) returns (address[] memory) {
        return deployerTokens[_deployer];
    }
    
    /**
     * @dev Get total number of deployed tokens
     */
    function getTotalTokens() external view returns (uint256) {
        return deployedTokens.length;
    }
    
    /**
     * @dev Get token information
     */
    function getTokenInfo(address _tokenAddress) external view validAddress(_tokenAddress) returns (TokenInfo memory) {
        return tokenInfo[_tokenAddress];
    }
    
    /**
     * @dev Get verified tokens only
     */
    function getVerifiedTokens() external view returns (address[] memory) {
        uint256 verifiedCount = 0;
        
        // Count verified tokens
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            if (tokenInfo[deployedTokens[i]].verified) {
                verifiedCount++;
            }
        }
        
        // Create array of verified tokens
        address[] memory verifiedTokens = new address[](verifiedCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            if (tokenInfo[deployedTokens[i]].verified) {
                verifiedTokens[index] = deployedTokens[i];
                index++;
            }
        }
        
        return verifiedTokens;
    }
    
    /**
     * @dev Get tokens by category
     */
    function getTokensByCategory(string memory _category) external view returns (address[] memory) {
        return categoryTokens[_category];
    }
    
    /**
     * @dev Get token count by category
     */
    function getTokenCountByCategory(string memory _category) external view returns (uint256) {
        return categoryTokens[_category].length;
    }
    
    /**
     * @dev Get deployer count
     */
    function getDeployerCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            address deployer = tokenInfo[deployedTokens[i]].deployer;
            bool found = false;
            for (uint256 j = 0; j < i; j++) {
                if (tokenInfo[deployedTokens[j]].deployer == deployer) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get all unique deployers
     */
    function getAllDeployers() external view returns (address[] memory) {
        address[] memory deployers = new address[](deployedTokens.length);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            address deployer = tokenInfo[deployedTokens[i]].deployer;
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (deployers[j] == deployer) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                deployers[uniqueCount] = deployer;
                uniqueCount++;
            }
        }
        
        // Resize array to actual count
        address[] memory result = new address[](uniqueCount);
        for (uint256 i = 0; i < uniqueCount; i++) {
            result[i] = deployers[i];
        }
        
        return result;
    }
    
    /**
     * @dev Update deployment fee (only owner)
     */
    function updateDeploymentFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = deploymentFee;
        deploymentFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Update fee collector (only owner)
     */
    function updateFeeCollector(address _newFeeCollector) external onlyOwner validAddress(_newFeeCollector) {
        address oldCollector = feeCollector;
        feeCollector = _newFeeCollector;
        emit FeeCollectorUpdated(oldCollector, _newFeeCollector);
    }
    
    /**
     * @dev Pause the factory (only owner)
     */
    function pause() external onlyOwner {
        paused = true;
        emit FactoryPaused(msg.sender);
    }
    
    /**
     * @dev Unpause the factory (only owner)
     */
    function unpause() external onlyOwner {
        paused = false;
        emit FactoryUnpaused(msg.sender);
    }
    
    /**
     * @dev Transfer ownership (only owner)
     */
    function transferOwnership(address _newOwner) external onlyOwner validAddress(_newOwner) {
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev Check if a token was deployed by this factory
     */
    function isTokenDeployed(address _tokenAddress) external view validAddress(_tokenAddress) returns (bool) {
        return tokenInfo[_tokenAddress].deployer != address(0);
    }
    
    /**
     * @dev Get factory statistics
     */
    function getFactoryStats() external view returns (
        uint256 totalTokens,
        uint256 verifiedTokens,
        uint256 totalDeployers,
        uint256 totalFeesCollected
    ) {
        totalTokens = deployedTokens.length;
        uint256 verified = 0;
        uint256 fees = 0;
        
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            TokenInfo memory info = tokenInfo[deployedTokens[i]];
            if (info.verified) {
                verified++;
            }
            fees += info.deploymentFee;
        }
        
        verifiedTokens = verified;
        totalDeployers = this.getDeployerCount();
        totalFeesCollected = fees;
    }
}