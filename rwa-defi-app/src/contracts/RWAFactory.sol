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
    
    struct TokenInfo {
        address deployer;
        string name;
        string symbol;
        uint256 deploymentTime;
        bool verified;
        string category; // e.g., "Real Estate", "Commodities", "Art", etc.
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "RWAFactory: caller is not the owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "RWAFactory: contract is paused");
        _;
    }
    
    event TokenDeployed(
        address indexed tokenAddress,
        address indexed deployer,
        string name,
        string symbol,
        string category
    );
    event TokenVerified(address indexed tokenAddress, address indexed verifier);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FactoryPaused(address indexed pauser);
    event FactoryUnpaused(address indexed unpauser);
    
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
    ) external payable whenNotPaused returns (address) {
        require(msg.value >= deploymentFee, "RWAFactory: insufficient fee");
        require(bytes(_name).length > 0, "RWAFactory: name cannot be empty");
        require(bytes(_symbol).length > 0, "RWAFactory: symbol cannot be empty");
        require(_initialSupply > 0, "RWAFactory: initial supply must be greater than 0");
        
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
            category: _category
        });
        
        // Track deployed tokens
        deployedTokens.push(tokenAddress);
        deployerTokens[msg.sender].push(tokenAddress);
        
        // Transfer deployment fee to fee collector
        if (deploymentFee > 0) {
            payable(feeCollector).transfer(deploymentFee);
        }
        
        // Refund excess payment
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit TokenDeployed(tokenAddress, msg.sender, _name, _symbol, _category);
        
        return tokenAddress;
    }
    
    /**
     * @dev Verify a deployed RWA token (only owner)
     */
    function verifyToken(address _tokenAddress) external onlyOwner {
        require(tokenInfo[_tokenAddress].deployer != address(0), "RWAFactory: token not found");
        require(!tokenInfo[_tokenAddress].verified, "RWAFactory: token already verified");
        
        tokenInfo[_tokenAddress].verified = true;
        
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
    function getTokensByDeployer(address _deployer) external view returns (address[] memory) {
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
    function getTokenInfo(address _tokenAddress) external view returns (TokenInfo memory) {
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
        uint256 categoryCount = 0;
        
        // Count tokens in category
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            if (keccak256(bytes(tokenInfo[deployedTokens[i]].category)) == keccak256(bytes(_category))) {
                categoryCount++;
            }
        }
        
        // Create array of category tokens
        address[] memory categoryTokens = new address[](categoryCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < deployedTokens.length; i++) {
            if (keccak256(bytes(tokenInfo[deployedTokens[i]].category)) == keccak256(bytes(_category))) {
                categoryTokens[index] = deployedTokens[i];
                index++;
            }
        }
        
        return categoryTokens;
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
    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "RWAFactory: invalid fee collector");
        feeCollector = _newFeeCollector;
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
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "RWAFactory: invalid new owner");
        owner = _newOwner;
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
    function isTokenDeployed(address _tokenAddress) external view returns (bool) {
        return tokenInfo[_tokenAddress].deployer != address(0);
    }
}