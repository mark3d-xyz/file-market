import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber as BN, Signer } from "ethers";
import {
  FraudDeciderWeb2V2,
  FraudDeciderWeb2V2__factory,
  PublicCollection,
  PublicCollection__factory,
  FilemarketExchangeV2,
  FilemarketExchangeV2__factory,
  Mark3dAccessTokenV2,
  Mark3dAccessTokenV2__factory,
  FilemarketCollectionV2,
  FilemarketCollectionV2__factory,
  FileBunniesCollection,
  FileBunniesCollection__factory,
} from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const pkey = process.env.PRIVATE_KEY;

describe("Public collection", async () => {
  const mintFee = ethers.utils.parseEther("0.1");

  describe("Trade token", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: PublicCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();
      if (pkey) {
        const admin = new ethers.Wallet(pkey);
        accounts = [admin.connect(ethers.provider), ...accounts];
        await accounts[5]
          .sendTransaction({to: accounts[0].getAddress(), value: ethers.utils.parseEther("5")})
      }

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new PublicCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
        "Mark3D public collection",
        "MARK3D",
        "",
        accounts[1].getAddress(),
        accounts[5].getAddress(),
        "0x",
        fraudDecider.address,
        true
      );

      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set mint fee", async () => {
      await collectionInstance.connect(accounts[0]).setMintFee(mintFee)
    })

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      const startBalance = await accounts[0].getBalance();
      await collectionInstance
        .connect(accounts[1])
        .mint(accounts[1].getAddress(), BN.from(0), "a", BN.from(1_000), "0x", {value: mintFee});

      expect(await accounts[0].getBalance())
        .to.eq(startBalance.add(mintFee))
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("finalize transfer", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .finalizeTransfer(BN.from(0));
      await expect(tx)
        .to.emit(collectionInstance, "TransferFinished")
        .withArgs(BN.from(0));
      await expect(tx)
        .to.emit(collectionInstance, "Transfer")
        .withArgs(
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          BN.from(0)
        );

      const price = 10000;
      const fee = price / 10;
      const royalty = (price - fee) / 10;
      await expect(tx).to.changeEtherBalance(
        accounts[1],
        BN.from(price - fee - royalty)
      );
      await expect(tx).to.changeEtherBalance(
        exchangeInstance.address,
        BN.from(fee - price)
      );
      await expect(tx).to.changeEtherBalance(accounts[5], BN.from(royalty));
    });

    it("withdraw fee", async () => {
      const tx = await exchangeInstance
        .connect(accounts[0])
        .withdrawFees(accounts[10].getAddress(), zeroAddress);

      await expect(tx).to.changeEtherBalance(accounts[10], BN.from(1000));
    });
  });

  describe("Trade token with whitelist", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: PublicCollection;
    let exchangeInstance: FilemarketExchangeV2;
    let start: number;

    before(async () => {
      start = Math.round(Date.now() / 1000) + 20000;
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new PublicCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        accounts[1].getAddress(),
        accounts[5].getAddress(),
        "0x",
        fraudDecider.address,
        true
      );

      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mint(accounts[1].getAddress(), BN.from(0), "a", BN.from(1_000), "0x");

      await collectionInstance
        .connect(accounts[1])
        .mint(accounts[1].getAddress(), BN.from(1), "a", BN.from(1_000), "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );

      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(1),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order no whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 2]);
      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(0),
          "0x",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: collection doesn't have whitelist"
      );
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 5]);
      await exchangeInstance
        .connect(accounts[0])
        .setWhitelistParams(
          collectionInstance.address,
          BN.from(start),
          BN.from(1000)
        );

      const deadline = await exchangeInstance.whitelistDeadlines(
        collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
        collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start));
      expect(discount).to.equal(BN.from(1000));
    });

    it("whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 8]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(0),
          "0x",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist deadline exceeds"
      );
    });

    it("fulfill with whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 11]);

      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 14]);

      await exchangeInstance
        .connect(accounts[0])
        .setWhitelistParams(
          collectionInstance.address,
          BN.from(start + 30),
          BN.from(1000)
        );

      const deadline = await exchangeInstance.whitelistDeadlines(
        collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
        collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start + 30));
      expect(discount).to.equal(BN.from(1000));
    });

    it("invalid signature", async () => {
      await ethers.provider.send("evm_mine", [start + 17]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0xa05ddc17394905fec70b15fc3209bd972f4dc2a53cb5168a3906a52c423928156e73c24e9915c8b116c6beb9e4b90f941ded6eddcdfbc89eb9f92a52ccf94e551b",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist invalid signature"
      );
    });

    it("fulfill with whitelist disabled", async () => {
      await ethers.provider.send("evm_mine", [start + 20]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(1), "0x", {
          value: BN.from(10000),
        });
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist period"
      );
    });

    it("fulfill whitelist wrong price", async () => {
      await ethers.provider.send("evm_mine", [start + 23]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
          "0x",
          {
            value: BN.from(10000),
          }
        );

      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: value must equal price with discount"
      );
    });

    it("fulfill whitelist success", async () => {
      await ethers.provider.send("evm_mine", [start + 26]);

      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
          "0x",
          {
            value: BN.from(9000),
          }
        );

      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(1), await accounts[2].getAddress());
    });
  });

  describe("Trade token with fraud not approved", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: PublicCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new PublicCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        accounts[1].getAddress(),
        accounts[5].getAddress(),
        "0x",
        fraudDecider.address,
        true
      );
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mint(accounts[1].getAddress(), BN.from(0), "a", 1_000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .reportFraud(BN.from(0), "0x12");
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudReported")
        .withArgs(BN.from(0));
    });

    it("fraud not approved", async () => {
      const tx = await fraudDecider
        .connect(accounts[0])
        .lateDecision(collectionInstance.address, BN.from(0), false);
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudDecided")
        .withArgs(BN.from(0), false);
      await expect(tx)
        .to.emit(collectionInstance, "Transfer")
        .withArgs(
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          BN.from(0)
        );
      await expect(tx).to.changeEtherBalance(
        accounts[1],
        BN.from(10000 - 1000 - 900)
      );
    });
  });

  describe("Trade token with fraud approved", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: PublicCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new PublicCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        accounts[1].getAddress(),
        accounts[5].getAddress(),
        "0x",
        fraudDecider.address,
        true
      );
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mint(accounts[1].getAddress(), BN.from(0), "a", 1_000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .reportFraud(BN.from(0), "0x12");
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudReported")
        .withArgs(BN.from(0));
    });

    it("fraud approved", async () => {
      const tx = await fraudDecider
        .connect(accounts[0])
        .lateDecision(collectionInstance.address, BN.from(0), true);
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudDecided")
        .withArgs(BN.from(0), true);
      await expect(tx).to.changeEtherBalance(accounts[2], BN.from(10000));
    });
  });
});

describe("Filemarket collection", async () => {
  const genRanHex = (size: number) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");

  describe("Trade token", async () => {
    let accounts: Signer[];
    let accessToken: Mark3dAccessTokenV2;
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FilemarketCollectionV2;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FilemarketCollectionV2__factory(
        accounts[0]
      );
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      const collectionToClone = await collectionFactory.deploy();
      fraudDecider = await fraudDeciderFactory.deploy();

      const encoder = new TextEncoder();
      const globalSalt = ethers.utils.hexlify(encoder.encode("Global Salt"));

      accessToken = await accessTokenFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        globalSalt,
        collectionToClone.address,
        true,
        fraudDecider.address
      );
      const salt = genRanHex(64);
      await accessToken
        .connect(accounts[1])
        .createCollection(
          "0x" + salt,
          "TEST",
          "TEST",
          "",
          "",
          await accounts[5].getAddress(),
          "0x"
        );
      const collectionAddress = await accessToken.predictDeterministicAddress(
        "0x" + salt
      );
      collectionInstance = collectionFactory.attach(collectionAddress);
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mintWithoutId(accounts[1].getAddress(), "a", BN.from(1_000), "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("finalize transfer", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .finalizeTransfer(BN.from(0));
      await expect(tx)
        .to.emit(collectionInstance, "TransferFinished")
        .withArgs(BN.from(0));
      await expect(tx)
        .to.emit(collectionInstance, "Transfer")
        .withArgs(
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          BN.from(0)
        );

      const price = 10000;
      const fee = price / 10;
      const royalty = (price - fee) / 10;
      await expect(tx).to.changeEtherBalance(
        accounts[1],
        BN.from(price - fee - royalty)
      );
      await expect(tx).to.changeEtherBalance(
        exchangeInstance.address,
        BN.from(fee - price)
      );
      await expect(tx).to.changeEtherBalance(accounts[5], BN.from(royalty));
    });

    it("withdraw fee", async () => {
      const tx = await exchangeInstance
        .connect(accounts[0])
        .withdrawFees(accounts[10].getAddress(), zeroAddress);

      await expect(tx).to.changeEtherBalance(accounts[10], BN.from(1000));
    });
  });

  describe("Trade token with whitelist", async () => {
    let accounts: Signer[];
    let accessToken: Mark3dAccessTokenV2;
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FilemarketCollectionV2;
    let exchangeInstance: FilemarketExchangeV2;
    let start: number;

    before(async () => {
      start = Math.round(Date.now() / 1000) + 30000;
      accounts = await ethers.getSigners();

      const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FilemarketCollectionV2__factory(
        accounts[0]
      );
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      const collectionToClone = await collectionFactory.deploy();
      fraudDecider = await fraudDeciderFactory.deploy();

      const encoder = new TextEncoder();
      const globalSalt = ethers.utils.hexlify(encoder.encode("Global Salt"));

      accessToken = await accessTokenFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        globalSalt,
        collectionToClone.address,
        true,
        fraudDecider.address
      );
      const salt = genRanHex(64);
      await accessToken
        .connect(accounts[1])
        .createCollection(
          "0x" + salt,
          "TEST",
          "TEST",
          "",
          "",
          await accounts[5].getAddress(),
          "0x"
        );
      const collectionAddress = await accessToken.predictDeterministicAddress(
        "0x" + salt
      );
      collectionInstance = collectionFactory.attach(collectionAddress);
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mintWithoutId(accounts[1].getAddress(), "a", 1000, "0x");
      await collectionInstance
        .connect(accounts[1])
        .mintWithoutId(accounts[1].getAddress(), "a", 1000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(1),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order no whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 2]);
      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(0),
          "0x",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: collection doesn't have whitelist"
      );
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 5]);
      await exchangeInstance
        .connect(accounts[0])
        .setWhitelistParams(
          collectionInstance.address,
          BN.from(start),
          BN.from(1000)
        );

      const deadline = await exchangeInstance.whitelistDeadlines(
        collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
        collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start));
      expect(discount).to.equal(BN.from(1000));
    });

    it("whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 8]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(0),
          "0x",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist deadline exceeds"
      );
    });

    it("fulfill with whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 11]);

      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 14]);

      await exchangeInstance
        .connect(accounts[0])
        .setWhitelistParams(
          collectionInstance.address,
          BN.from(start + 30),
          BN.from(1000)
        );

      const deadline = await exchangeInstance.whitelistDeadlines(
        collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
        collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start + 30));
      expect(discount).to.equal(BN.from(1000));
    });

    it("invalid signature", async () => {
      await ethers.provider.send("evm_mine", [start + 17]);
      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0xa05ddc17394905fec70b15fc3209bd972f4dc2a53cb5168a3906a52c423928156e73c24e9915c8b116c6beb9e4b90f941ded6eddcdfbc89eb9f92a52ccf94e551b",
          "0x",
          {
            value: BN.from(10000),
          }
        );
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist invalid signature"
      );
    });

    it("fulfill with whitelist disabled", async () => {
      await ethers.provider.send("evm_mine", [start + 20]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(1), "0x", {
          value: BN.from(10000),
        });
      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: whitelist period"
      );
    });

    it("fulfill whitelist wrong price", async () => {
      await ethers.provider.send("evm_mine", [start + 23]);

      const tx = exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
          "0x",
          {
            value: BN.from(10000),
          }
        );

      await expect(tx).to.revertedWith(
        "FilemarketExchangeV2: value must equal price with discount"
      );
    });

    it("fulfill whitelist success", async () => {
      await ethers.provider.send("evm_mine", [start + 26]);

      const tx = await exchangeInstance
        .connect(accounts[2])
        .fulfillOrderWhitelisted(
          collectionInstance.address,
          "0xa1",
          BN.from(1),
          "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
          "0x",
          {
            value: BN.from(9000), // -10%
          }
        );

      await expect(tx)
        .to.emit(collectionInstance, "TransferDraftCompletion")
        .withArgs(BN.from(1), await accounts[2].getAddress());
    });
  });

  describe("Trade token with fraud not approved", async () => {
    let accounts: Signer[];
    let accessToken: Mark3dAccessTokenV2;
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FilemarketCollectionV2;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FilemarketCollectionV2__factory(
        accounts[0]
      );
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      const collectionToClone = await collectionFactory.deploy();
      fraudDecider = await fraudDeciderFactory.deploy();

      const encoder = new TextEncoder();
      const globalSalt = ethers.utils.hexlify(encoder.encode("Global Salt"));

      accessToken = await accessTokenFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        globalSalt,
        collectionToClone.address,
        true,
        fraudDecider.address
      );
      const salt = genRanHex(64);
      await accessToken
        .connect(accounts[1])
        .createCollection(
          "0x" + salt,
          "TEST",
          "TEST",
          "",
          "",
          await accounts[5].getAddress(),
          "0x"
        );
      const collectionAddress = await accessToken.predictDeterministicAddress(
        "0x" + salt
      );
      collectionInstance = collectionFactory.attach(collectionAddress);
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mintWithoutId(accounts[1].getAddress(), "a", 1000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .reportFraud(BN.from(0), "0x12");
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudReported")
        .withArgs(BN.from(0));
    });

    it("fraud approved", async () => {
      const tx = await fraudDecider
        .connect(accounts[0])
        .lateDecision(collectionInstance.address, BN.from(0), false);
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudDecided")
        .withArgs(BN.from(0), false);
      await expect(tx)
        .to.emit(collectionInstance, "Transfer")
        .withArgs(
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          BN.from(0)
        );
      await expect(tx).to.changeEtherBalance(
        accounts[1],
        BN.from(10000 - 1000 - 900)
      );
    });
  });

  describe("Trade token with fraud approved", async () => {
    let accounts: Signer[];
    let accessToken: Mark3dAccessTokenV2;
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FilemarketCollectionV2;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FilemarketCollectionV2__factory(
        accounts[0]
      );
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      const collectionToClone = await collectionFactory.deploy();
      fraudDecider = await fraudDeciderFactory.deploy();

      const encoder = new TextEncoder();
      const globalSalt = ethers.utils.hexlify(encoder.encode("Global Salt"));

      accessToken = await accessTokenFactory.deploy(
        "Mark3D Access Token",
        "MARK3D",
        "",
        globalSalt,
        collectionToClone.address,
        true,
        fraudDecider.address
      );
      const salt = genRanHex(64);
      await accessToken
        .connect(accounts[1])
        .createCollection(
          "0x" + salt,
          "TEST",
          "TEST",
          "",
          "",
          await accounts[5].getAddress(),
          "0x"
        );
      const collectionAddress = await accessToken.predictDeterministicAddress(
        "0x" + salt
      );
      collectionInstance = collectionFactory.attach(collectionAddress);
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
        .to.emit(exchangeInstance, "FeeChanged")
        .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
        .connect(accounts[1])
        .mintWithoutId(accounts[1].getAddress(), "a", 1000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
        .connect(accounts[1])
        .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
        .connect(accounts[1])
        .placeOrder(
          collectionInstance.address,
          BN.from(0),
          BN.from(10000),
          zeroAddress
        );
    });

    it("fulfill order", async () => {
      await exchangeInstance
        .connect(accounts[2])
        .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
          value: BN.from(10000),
        });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
        .connect(accounts[1])
        .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
        .to.emit(collectionInstance, "TransferPasswordSet")
        .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
        .connect(accounts[2])
        .reportFraud(BN.from(0), "0x12");
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudReported")
        .withArgs(BN.from(0));
    });

    it("fraud approved", async () => {
      const tx = await fraudDecider
        .connect(accounts[0])
        .lateDecision(collectionInstance.address, BN.from(0), true);
      await expect(tx)
        .to.emit(collectionInstance, "TransferFraudDecided")
        .withArgs(BN.from(0), true);
      await expect(tx).to.changeEtherBalance(accounts[2], BN.from(10000));
    });
  });
});

describe("File Bunnies collection", async () => {
  describe("Trade token", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FileBunniesCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FileBunniesCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
          "Mark3D collection",
          "MARK3D",
          "",
          accounts[1].getAddress(),
          accounts[2].getAddress(),
          accounts[4].getAddress(),
          accounts[5].getAddress(),
          "0x",
          fraudDecider.address,
          true
      );

      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
          .to.emit(exchangeInstance, "FeeChanged")
          .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
          .connect(accounts[1])
          .mint(accounts[1].getAddress(), BN.from(0), "a", BN.from(1_000), "0x");
    });

    it("approve", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
          .connect(accounts[1])
          .placeOrder(
              collectionInstance.address,
              BN.from(0),
              BN.from(10000),
              zeroAddress
          );
    });

    it("fulfill order", async () => {
      const tx = await exchangeInstance
          .connect(accounts[2])
          .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
            value: BN.from(10000),
          });
      await expect(tx)
          .to.emit(collectionInstance, "TransferDraftCompletion")
          .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
          .connect(accounts[1])
          .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
          .to.emit(collectionInstance, "TransferPasswordSet")
          .withArgs(BN.from(0), "0x34");
    });

    it("finalize transfer", async () => {
      const tx = await collectionInstance
          .connect(accounts[2])
          .finalizeTransfer(BN.from(0));
      await expect(tx)
          .to.emit(collectionInstance, "TransferFinished")
          .withArgs(BN.from(0));
      await expect(tx)
          .to.emit(collectionInstance, "Transfer")
          .withArgs(
              await accounts[1].getAddress(),
              await accounts[2].getAddress(),
              BN.from(0)
          );

      const price = 10000;
      const fee = price / 10;
      const royalty = (price - fee) / 10;
      await expect(tx).to.changeEtherBalance(
          accounts[1],
          BN.from(price - fee - royalty)
      );
      await expect(tx).to.changeEtherBalance(
          exchangeInstance.address,
          BN.from(fee - price)
      );
      await expect(tx).to.changeEtherBalance(accounts[5], BN.from(royalty));
    });

    it("withdraw fee", async () => {
      const tx = await exchangeInstance
          .connect(accounts[0])
          .withdrawFees(accounts[10].getAddress(), zeroAddress);

      await expect(tx).to.changeEtherBalance(accounts[10], BN.from(1000));
    });
  });

  describe("Trade token with whitelist", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FileBunniesCollection;
    let exchangeInstance: FilemarketExchangeV2;
    let start: number;

    before(async () => {
      start = Math.round(Date.now() / 1000) + 40000;
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FileBunniesCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
          "Mark3D Access Token",
          "MARK3D",
          "",
          accounts[1].getAddress(),
          accounts[0].getAddress(), // hardcoded signature was made with this address
          accounts[4].getAddress(),
          accounts[5].getAddress(),
          "0x",
          fraudDecider.address,
          true
      );

      exchangeInstance = await exchangeFactory.deploy();
    });

    it("set fee", async () => {
      const tx = await exchangeInstance.setFee(BN.from(1000));
      await expect(tx)
          .to.emit(exchangeInstance, "FeeChanged")
          .withArgs(BN.from(1000));
    });

    it("mint", async () => {
      await collectionInstance
          .connect(accounts[1])
          .mint(accounts[1].getAddress(), BN.from(0), "a", BN.from(1_000), "0x");
      await collectionInstance
          .connect(accounts[1])
          .mintBatchWithoutMeta(
              accounts[1].getAddress(),
              BN.from(1),
              BN.from(1),
              BN.from(1_000),
              ["0x"]
          );
    });

    it("approve", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
          .connect(accounts[1])
          .placeOrder(
              collectionInstance.address,
              BN.from(0),
              BN.from(10000),
              zeroAddress
          );
      await exchangeInstance
          .connect(accounts[1])
          .placeOrder(
              collectionInstance.address,
              BN.from(1),
              BN.from(10000),
              zeroAddress
          );
    });

    it("fulfill order no whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 2]);
      const tx = exchangeInstance
          .connect(accounts[2])
          .fulfillOrderWhitelisted(
              collectionInstance.address,
              "0xa1",
              BN.from(0),
              "0x",
              "0x",
              {
                value: BN.from(10000),
              }
          );
      await expect(tx).to.revertedWith(
          "FilemarketExchangeV2: collection doesn't have whitelist"
      );
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 5]);
      await exchangeInstance
          .connect(accounts[0])
          .setWhitelistParams(
              collectionInstance.address,
              BN.from(start),
              BN.from(10000)
          );

      const deadline = await exchangeInstance.whitelistDeadlines(
          collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
          collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start));
      expect(discount).to.equal(BN.from(10000));
    });

    it("whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 8]);

      const tx = exchangeInstance
          .connect(accounts[2])
          .fulfillOrderWhitelisted(
              collectionInstance.address,
              "0xa1",
              BN.from(0),
              "0x",
              "0x",
              {
                value: BN.from(10000),
              }
          );
      await expect(tx).to.revertedWith(
          "FilemarketExchangeV2: whitelist deadline exceeds"
      );
    });

    it("fulfill with whitelist deadline exceeds", async () => {
      await ethers.provider.send("evm_mine", [start + 11]);

      const tx = await exchangeInstance
          .connect(accounts[2])
          .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
            value: BN.from(10000),
          });
      await expect(tx)
          .to.emit(collectionInstance, "TransferDraftCompletion")
          .withArgs(BN.from(0), await accounts[2].getAddress());
    });

    it("set whitelist", async () => {
      await ethers.provider.send("evm_mine", [start + 14]);

      await exchangeInstance
          .connect(accounts[0])
          .setWhitelistParams(
              collectionInstance.address,
              BN.from(start + 30),
              BN.from(10000)
          );

      const deadline = await exchangeInstance.whitelistDeadlines(
          collectionInstance.address
      );
      const discount = await exchangeInstance.whitelistDiscounts(
          collectionInstance.address
      );
      expect(deadline).to.equal(BN.from(start + 30));
      expect(discount).to.equal(BN.from(10000));
    });

    it("invalid signature", async () => {
      await ethers.provider.send("evm_mine", [start + 17]);

      const tx = exchangeInstance
          .connect(accounts[2])
          .fulfillOrderWhitelisted(
              collectionInstance.address,
              "0xa1",
              BN.from(1),
              "0xa05ddc17394905fec70b15fc3209bd972f4dc2a53cb5168a3906a52c423928156e73c24e9915c8b116c6beb9e4b90f941ded6eddcdfbc89eb9f92a52ccf94e551b",
              "0x",
              {
                value: BN.from(10000),
              }
          );
      await expect(tx).to.revertedWith(
          "FilemarketExchangeV2: whitelist invalid signature"
      );
    });

    it("fulfill with whitelist disabled", async () => {
      await ethers.provider.send("evm_mine", [start + 20]);

      const tx = exchangeInstance
          .connect(accounts[2])
          .fulfillOrder(collectionInstance.address, "0xa1", BN.from(1), "0x", {
            value: BN.from(10000),
          });
      await expect(tx).to.revertedWith("FilemarketExchangeV2: whitelist period");
    });

    it("fullfill whitelist wrong price", async () => {
      await ethers.provider.send("evm_mine", [start + 23]);

      const tx = exchangeInstance
          .connect(accounts[2])
          .fulfillOrderWhitelisted(
              collectionInstance.address,
              "0xa1",
              BN.from(1),
              "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
              "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
              {
                value: BN.from(10000),
              }
          );

      await expect(tx).to.revertedWith(
          "FilemarketExchangeV2: value must equal price with discount"
      );
    });

    it("add cids", async () => {
      await collectionInstance
          .connect(accounts[1])
          .addCommonCids(BN.from(0), ["cm meta 1"]);

      expect(await collectionInstance.connect(accounts[1]).commonCids(0)).to.eq(
          "cm meta 1"
      );
    });

    it("fullfill whitelist success", async () => {
      await ethers.provider.send("evm_mine", [start + 26]);

      const tx = await exchangeInstance
          .connect(accounts[2])
          .fulfillOrderWhitelisted(
              collectionInstance.address,
              "0xa1",
              BN.from(1),
              "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
              "0x1939d953cd4e47fe7e2f1e454ff366caf7e58d3a4a6a4a0e6a6ce2c4b22fdcbe0a460e1730fc0b538f4f4e167ef1b9307d403fe1af34e2b1ef1904d6d7750c831c",
              {
                value: BN.from(0),
              }
          );

      await expect(tx)
          .to.emit(collectionInstance, "TransferDraftCompletion")
          .withArgs(BN.from(1), await accounts[2].getAddress());

      let throwFlag = true;
      try {
        // should throw. CommonCid array is empty
        await collectionInstance.connect(accounts[1]).commonCids(BN.from(0));
        throwFlag = false;
      } catch {}
      expect(throwFlag).to.eq(true);

      expect(await collectionInstance.connect(accounts[1]).tokenUris(1)).to.eq(
          "ipfs://cm meta 1"
      );
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
          .connect(accounts[1])
          .approveTransfer(BN.from(1), "0x34");
      await expect(tx)
          .to.emit(collectionInstance, "TransferPasswordSet")
          .withArgs(BN.from(1), "0x34");
    });

    it("finalize transfer", async () => {
      const tx = await collectionInstance
          .connect(accounts[2])
          .finalizeTransfer(BN.from(1));
      await expect(tx)
          .to.emit(collectionInstance, "TransferFinished")
          .withArgs(BN.from(1));
      await expect(tx)
          .to.emit(collectionInstance, "Transfer")
          .withArgs(
              await accounts[1].getAddress(),
              await accounts[2].getAddress(),
              BN.from(1)
          );

      const price = 10000;
      const fee = price / 10;
      const royalty = (price - fee) / 10;
      await expect(tx).to.changeEtherBalance(
          accounts[1],
          BN.from(price - fee - royalty)
      );
      await expect(tx).to.changeEtherBalance(
          exchangeInstance.address,
          BN.from(fee - price)
      );
      await expect(tx).to.changeEtherBalance(accounts[5], BN.from(royalty));
    });

    it("set free tokens start sales date", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setFreeTokensSalesStartTimestamp(start + 50);
    });

    it("approve", async () => {
      await collectionInstance
          .connect(accounts[2])
          .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order of free mint token before sales start day", async () => {
      await ethers.provider.send("evm_mine", [start + 40]);
      const tx = exchangeInstance
          .connect(accounts[2])
          .placeOrder(
              collectionInstance.address,
              BN.from(1),
              BN.from(10000),
              zeroAddress
          );
      await expect(tx).to.revertedWith(
          "FileBunniesCollection: transfer can't be done before sales start day"
      );
    });

    it("set free tokens start sales date", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setFreeTokensSalesStartTimestamp(start + 40);
    });

    it("create order of free mint token after sales start day", async () => {
      await ethers.provider.send("evm_mine", [start + 50]);
      await exchangeInstance
          .connect(accounts[2])
          .placeOrder(
              collectionInstance.address,
              BN.from(1),
              BN.from(10000),
              zeroAddress
          );
    });
  });

  describe("Trade token with fraud not approved", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FileBunniesCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FileBunniesCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
          "Mark3D Access Token",
          "MARK3D",
          "",
          accounts[1].getAddress(),
          accounts[3].getAddress(),
          accounts[4].getAddress(),
          accounts[5].getAddress(),
          "0x",
          fraudDecider.address,
          true
      );
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("mint", async () => {
      await collectionInstance
          .connect(accounts[1])
          .mint(accounts[1].getAddress(), BN.from(0), "a", 1_000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
          .connect(accounts[1])
          .placeOrder(
              collectionInstance.address,
              BN.from(0),
              BN.from(10000),
              zeroAddress
          );
    });

    it("fulfill order", async () => {
      await exchangeInstance
          .connect(accounts[2])
          .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
            value: BN.from(10000),
          });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
          .connect(accounts[1])
          .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
          .to.emit(collectionInstance, "TransferPasswordSet")
          .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
          .connect(accounts[2])
          .reportFraud(BN.from(0), "0x12");
      await expect(tx)
          .to.emit(collectionInstance, "TransferFraudReported")
          .withArgs(BN.from(0));
    });

    it("fraud approved", async () => {
      const tx = await fraudDecider
          .connect(accounts[0])
          .lateDecision(collectionInstance.address, BN.from(0), false);
      await expect(tx)
          .to.emit(collectionInstance, "TransferFraudDecided")
          .withArgs(BN.from(0), false);
      await expect(tx)
          .to.emit(collectionInstance, "Transfer")
          .withArgs(
              await accounts[1].getAddress(),
              await accounts[2].getAddress(),
              BN.from(0)
          );
      await expect(tx).to.changeEtherBalance(accounts[1], BN.from(9000));
    });
  });

  describe("Trade token with fraud approved", async () => {
    let accounts: Signer[];
    let fraudDecider: FraudDeciderWeb2V2;
    let collectionInstance: FileBunniesCollection;
    let exchangeInstance: FilemarketExchangeV2;

    before(async () => {
      accounts = await ethers.getSigners();

      const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
      const collectionFactory = new FileBunniesCollection__factory(accounts[0]);
      const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);

      fraudDecider = await fraudDeciderFactory.deploy();
      collectionInstance = await collectionFactory.deploy(
          "Mark3D Access Token",
          "MARK3D",
          "",
          accounts[1].getAddress(),
          accounts[3].getAddress(),
          accounts[4].getAddress(),
          accounts[5].getAddress(),
          "0x",
          fraudDecider.address,
          true
      );
      exchangeInstance = await exchangeFactory.deploy();
    });

    it("mint", async () => {
      await collectionInstance
          .connect(accounts[1])
          .mint(accounts[1].getAddress(), BN.from(0), "a", 1_000, "0x");
    });

    it("approve", async () => {
      await collectionInstance
          .connect(accounts[1])
          .setApprovalForAll(exchangeInstance.address, true);
    });

    it("create order", async () => {
      await exchangeInstance
          .connect(accounts[1])
          .placeOrder(
              collectionInstance.address,
              BN.from(0),
              BN.from(10000),
              zeroAddress
          );
    });

    it("fulfill order", async () => {
      await exchangeInstance
          .connect(accounts[2])
          .fulfillOrder(collectionInstance.address, "0xa1", BN.from(0), "0x", {
            value: BN.from(10000),
          });
    });

    it("set encrypted password", async () => {
      const tx = await collectionInstance
          .connect(accounts[1])
          .approveTransfer(BN.from(0), "0x34");
      await expect(tx)
          .to.emit(collectionInstance, "TransferPasswordSet")
          .withArgs(BN.from(0), "0x34");
    });

    it("report fraud", async () => {
      const tx = await collectionInstance
          .connect(accounts[2])
          .reportFraud(BN.from(0), "0x12");
      await expect(tx)
          .to.emit(collectionInstance, "TransferFraudReported")
          .withArgs(BN.from(0));
    });

    it("fraud approved", async () => {
      const tx = await fraudDecider
          .connect(accounts[0])
          .lateDecision(collectionInstance.address, BN.from(0), true);
      await expect(tx)
          .to.emit(collectionInstance, "TransferFraudDecided")
          .withArgs(BN.from(0), true);
      await expect(tx).to.changeEtherBalance(accounts[2], BN.from(10000));
    });
  });
});