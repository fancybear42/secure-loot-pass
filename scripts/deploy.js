const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SecureLootPass contract...");

  // Get the contract factory
  const SecureLootPass = await ethers.getContractFactory("SecureLootPass");

  // Deploy the contract
  // For now, we'll use the deployer as the verifier
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const secureLootPass = await SecureLootPass.deploy(deployer.address);

  await secureLootPass.deployed();

  console.log("SecureLootPass deployed to:", secureLootPass.address);
  console.log("Verifier set to:", deployer.address);

  // Save the deployment info
  const deploymentInfo = {
    contractAddress: secureLootPass.address,
    verifier: deployer.address,
    deployer: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Contract Address:", deploymentInfo.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
