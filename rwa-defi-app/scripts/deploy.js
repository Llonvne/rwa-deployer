const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying contracts...");

  // Get contract artifacts
  const testUSDTArtifact = await ethers.getContractFactory("TestUSDT");
  const rwaFactoryArtifact = await ethers.getContractFactory("RWAFactory");
  const rwaTokenArtifact = await ethers.getContractFactory("RWAToken");

  // Extract bytecode and ABI
  const contractData = {
    TestUSDT: {
      bytecode: testUSDTArtifact.bytecode,
      abi: testUSDTArtifact.interface.format()
    },
    RWAFactory: {
      bytecode: rwaFactoryArtifact.bytecode,
      abi: rwaFactoryArtifact.interface.format()
    },
    RWAToken: {
      bytecode: rwaTokenArtifact.bytecode,
      abi: rwaTokenArtifact.interface.format()
    }
  };

  // Save contract data to a JSON file for frontend use
  const contractDataPath = path.join(__dirname, "../src/lib/contract-data.json");
  fs.writeFileSync(contractDataPath, JSON.stringify(contractData, null, 2));
  console.log("Contract data saved to:", contractDataPath);

  // Deploy contracts for testing (optional)
  try {
    // Deploy TestUSDT
    const testUSDT = await testUSDTArtifact.deploy("Test USD Tether", "TUSDT", 6);
    await testUSDT.waitForDeployment();
    const testUSDTAddress = await testUSDT.getAddress();
    console.log("TestUSDT deployed to:", testUSDTAddress);

    // Deploy RWAFactory
    const deploymentFee = ethers.parseEther("0.001"); // 0.001 ETH
    const rwaFactory = await rwaFactoryArtifact.deploy(deploymentFee);
    await rwaFactory.waitForDeployment();
    const rwaFactoryAddress = await rwaFactory.getAddress();
    console.log("RWAFactory deployed to:", rwaFactoryAddress);

    // Save deployment addresses
    const deploymentInfo = {
      TestUSDT: testUSDTAddress,
      RWAFactory: rwaFactoryAddress,
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId
    };

    const deploymentPath = path.join(__dirname, "../src/lib/deployment-info.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", deploymentPath);

    console.log("\nDeployment Summary:");
    console.log("===================");
    console.log("TestUSDT:", testUSDTAddress);
    console.log("RWAFactory:", rwaFactoryAddress);
    console.log("Network:", deploymentInfo.network);
    console.log("Chain ID:", deploymentInfo.chainId);
  } catch (error) {
    console.log("Note: Contract deployment failed, but bytecode has been extracted successfully.");
    console.log("This is expected when running without a local blockchain node.");
    console.log("The frontend will use the extracted bytecode for deployment.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });