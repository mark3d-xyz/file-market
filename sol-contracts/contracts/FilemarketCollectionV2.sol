// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "./IFraudDecider.sol";
import "./IAccessToken.sol";
import "./IEncryptedFileToken.sol";
import "./IEncryptedFileTokenUpgradeable.sol";
import "./IEncryptedFileTokenCallbackReceiver.sol";

contract FilemarketCollectionV2 is IEncryptedFileTokenUpgradeableV2, ERC721EnumerableUpgradeable, OwnableUpgradeable, IERC2981 {
    /// @dev TokenData - struct with basic token data
    struct TokenData {
        uint256 id;             // token id
        string metaUri;         // metadata uri
        bytes data;             // additional data
    }

    /// @dev TransferInfo - transfer process info
    struct TransferInfo {
        uint256 id;                                             // token id
        address initiator;                                      // transfer initiator
        address from;                                           // transfer sender
        address to;                                             // transfer target
        IEncryptedFileTokenCallbackReceiver callbackReceiver;   // callback receiver
        bytes data;                                             // transfer data
        bytes publicKey;                                        // public key of receiver
        bytes encryptedPassword;                                // encrypted password
        bool fraudReported;                                     // if fraud reported while finalizing transfer
        uint256 publicKeySetAt;                                 // public key set at
        uint256 passwordSetAt;                                  // password set at
    }

    address public constant defaultAdmin = 0x29957549fcfdd278C72D92721A263C57F603663b;

    uint256 public constant PERCENT_MULTIPLIER = 10000;
    uint256 public constant ROYALTY_CEILING = 5000;            // 50%

    address public admin;
    uint256 public mintFee;
    address public mintFeeReceiver;
    uint256 public accessTokenId;                              // access token id
    IAccessToken public accessToken;                           // Access token contract address
    bytes public collectionData;                               // collection additional data
    string private contractMetaUri;                            // contract-level metadata
    mapping(uint256 => string) public tokenUris;               // mapping of token metadata uri
    mapping(uint256 => bytes) public tokenData;                // mapping of token additional data
    mapping(uint256 => uint256) public royalties;              // mapping of token to royalty
    address public royaltyReceiver;
    uint256 public tokensCount;                                // count of minted tokens
    uint256 public tokensLimit;                                // mint limit
    mapping(uint256 => TransferInfo) private transfers;        // transfer details
    mapping(uint256 => uint256) public transferCounts;         // count of transfers per transfer
    bool private fraudLateDecisionEnabled;                     // false if fraud decision is instant
    IFraudDecider private fraudDecider_;                       // fraud decider
    uint256 public finalizeTransferTimeout;                    // Time before transfer finalizes automatically 
    uint256 private salesStartTimestamp;                       // Time when users can start transfer tokens 

    /// @dev modifier for checking if call is from the access token contract
    modifier onlyAccessToken() {
        require(_msgSender() == address(accessToken), "FilemarketCollectionV2: allowed to call only from access token");
        _;
    }

    /// @dev initialize function
    /// @param name - name of the token
    /// @param symbol - symbol of the token
    /// @param _contractMetaUri - contract-level metadata uri
    /// @param _accessToken - access token contract address
    /// @param _accessTokenId - access token id
    /// @param _owner - collection creator
    /// @param _royaltyReceiver - address that will receive royalty
    /// @param _data - additional collection data
    /// @param _fraudDecider - fraud decider instance
    /// @param _fraudLateDecisionEnabled - if fraud decision is not instant
    function initialize(
        string memory name,
        string memory symbol,
        string memory _contractMetaUri,
        IAccessToken _accessToken,
        uint256 _accessTokenId,
        address _owner,
        address _royaltyReceiver,
        bytes memory _data,
        IFraudDecider _fraudDecider,
        bool _fraudLateDecisionEnabled
    ) external initializer {
        __ERC721_init(name, symbol);

        admin = defaultAdmin;
        tokensCount = 0;
        contractMetaUri = _contractMetaUri;
        accessTokenId = _accessTokenId;
        accessToken = _accessToken;
        collectionData = _data;
        tokensLimit = 10000;
        fraudDecider_ = _fraudDecider;
        fraudLateDecisionEnabled = _fraudLateDecisionEnabled;
        finalizeTransferTimeout = 24 hours;
        salesStartTimestamp = block.timestamp - 1 minutes;
        royaltyReceiver = _royaltyReceiver;
        _transferOwnership(_owner);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721EnumerableUpgradeable, IERC165Upgradeable, IERC165) returns (bool) {
        return
            interfaceId == type(IEncryptedFileTokenUpgradeable).interfaceId ||
            interfaceId == type(IEncryptedFileToken).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
    /// @return Metadata file URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return tokenUris[tokenId];
    }

    /// @dev Function to detect if fraud decision instant. Should return false in EVM chains and true in Filecoin
    /// @return Boolean indicating if fraud decision will be instant
    function fraudDecisionInstant() external view returns (bool) {
        return !fraudLateDecisionEnabled;
    }

    /// @dev Function to get fraud decider instance for this token
    /// @return IFraudDecider instance
    function fraudDecider() external view returns (IFraudDecider) {
        return fraudDecider_;
    }

    /// @dev Mint function. Can called only by the owner
    /// @param to - token receiver
    /// @param id - token id
    /// @param metaUri - metadata uri
    /// @param royalty - royalty
    /// @param _data - additional token data
    function mint(
        address to,
        uint256 id,
        string memory metaUri,
        uint256 royalty,
        bytes memory _data
    ) external payable onlyOwner {
        require(bytes(metaUri).length > 0, "FilemarketCollectionV2: empty meta uri");
        require(id < tokensLimit, "FilemarketCollectionV2: limit reached");
        require(msg.value >= mintFee, "FilemarketCollectionV2: Insufficient minting fee");

        _mint(to, id, metaUri, _data, royalty);

        if (mintFee != 0) {
            (bool sent,) = mintFeeReceiver.call{value: msg.value}("");
            require(sent, "FilemarketCollectionV2: failed to send like fee");
        }
    }

    /// @dev Mint function without id. Can called only by the owner. Equivalent to mint(to, tokensCount(), metaUri, _data)
    /// @param to - token receiver
    /// @param metaUri - metadata uri
    /// @param _data - additional token data
    /// @param royalty - royalty
    function mintWithoutId(
        address to,
        string memory metaUri,
        uint256 royalty,
        bytes memory _data
    ) external payable onlyOwner returns (uint256) {
        require(bytes(metaUri).length > 0, "FilemarketCollectionV2: empty meta uri");
        require(msg.value >= mintFee, "FilemarketCollectionV2: Insufficient minting fee");

        uint256 id = tokensCount;
        require(id < tokensLimit, "FilemarketCollectionV2: limit reached");
        _mint(to, id, metaUri, _data, royalty);

        if (mintFee != 0) {
            (bool sent,) = mintFeeReceiver.call{value: msg.value}("");
            require(sent, "FilemarketCollectionV2: failed to send like fee");
        }

        return id;
    }

    /// @dev Mint batch of tokens. Can called only by the owner
    /// @param to - tokens receiver
    /// @param count - tokens quantity to mint
    /// @param metaUris - metadata uri list
    /// @param _data - additional token data list
    /// @param royalty - royalty list
    function mintBatch(
        address to,
        uint256 count,
        string[] memory metaUris,
        bytes[] memory _data,
        uint256[] memory royalty
    ) external payable onlyOwner {
        require(count == metaUris.length, "FilemarketCollectionV2: metaUri list length must be equal to count");
        require(count == _data.length, "FilemarketCollectionV2: _data list length must be equal to count");
        require(count == royalty.length, "FilemarketCollectionV2: royalty list length must be equal to count");
        require(msg.value >= mintFee * count, "FilemarketCollectionV2: Insufficient minting fee");

        uint256 id = tokensCount;
        for (uint256 i = 0; i < count; i++) {
            require(id < tokensLimit, "FilemarketCollectionV2: limit reached");
            _mint(to, id, metaUris[i], _data[i], royalty[i]);
            id++;
        }

        if (mintFee != 0) {
            (bool sent,) = mintFeeReceiver.call{value: msg.value}("");
            require(sent, "FilemarketCollectionV2: failed to send like fee");
        }
    }

    /// @dev burn function
    /// @param id - token id
    function burn(uint256 id) external {
        require(ownerOf(id) == _msgSender(), "FilemarketCollectionV2: not an owner of token");
        _burn(id);
    }

    function getTransferInfo(uint256 tokenId) external view returns (TransferInfo memory) {
        return transfers[tokenId];
    }

    /**
     * @dev See {IEncryptedFileToken-initTransfer}.
     */
    function initTransfer(
        uint256 tokenId,
        address to,
        bytes calldata data,
        IEncryptedFileTokenCallbackReceiver callbackReceiver
    ) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "FilemarketCollectionV2: caller is not token owner or approved");
        require(transfers[tokenId].initiator == address(0), "FilemarketCollectionV2: transfer for this token was already created");
        transfers[tokenId] = TransferInfo(tokenId, _msgSender(), _msgSender(), to,
            callbackReceiver, data, bytes(""), bytes(""), false, 0, 0);
        transferCounts[tokenId]++;

        emit TransferInit(tokenId, ownerOf(tokenId), to, transferCounts[tokenId]);
    }

    /**
     * @dev See {IEncryptedFileToken-draftTransfer}.
     */
    function draftTransfer(
        uint256 tokenId,
        IEncryptedFileTokenCallbackReceiver callbackReceiver
    ) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "FilemarketCollectionV2: caller is not token owner or approved");
        require(transfers[tokenId].initiator == address(0), "FilemarketCollectionV2: transfer for this token was already created");
        require(owner() == _msgSender() || block.timestamp > salesStartTimestamp, "FilemarketCollectionV2: transfer can't be done before sales start day");
        transfers[tokenId] = TransferInfo(tokenId, _msgSender(), ownerOf(tokenId), address(0),
            callbackReceiver, bytes(""), bytes(""), bytes(""), false, 0, 0);
        transferCounts[tokenId]++;

        emit TransferDraft(tokenId, ownerOf(tokenId), transferCounts[tokenId]);
    }

    /**
     * @dev See {IEncryptedFileToken-completeTransferDraft}.
     */
    function completeTransferDraft(
        uint256 tokenId,
        address to,
        bytes calldata publicKey,
        bytes calldata data
    ) external {
        require(publicKey.length > 0, "FilemarketCollectionV2: empty public key");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(_msgSender() == info.initiator, "FilemarketCollectionV2: permission denied");
        require(info.to == address(0), "FilemarketCollectionV2: draft already complete");
        info.to = to;
        info.data = data;
        info.publicKey = publicKey;
        info.publicKeySetAt = block.timestamp;
        emit TransferDraftCompletion(tokenId, to);
        emit TransferPublicKeySet(tokenId, publicKey);
    }

    /**
     * @dev See {IEncryptedFileToken-setTransferPublicKey}.
     */
    function setTransferPublicKey(uint256 tokenId, bytes calldata publicKey, uint256 transferNumber) external {
        require(publicKey.length > 0, "FilemarketCollectionV2: empty public key");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(info.to == _msgSender(), "FilemarketCollectionV2: permission denied");
        require(info.publicKey.length == 0, "FilemarketCollectionV2: public key was already set");
        require(transferNumber == transferCounts[tokenId], "FilemarketCollectionV2: the transfer is not the latest transfer of this token");
        info.publicKey = publicKey;
        info.publicKeySetAt = block.timestamp;
        emit TransferPublicKeySet(tokenId, publicKey);
    }

    /**
     * @dev See {IEncryptedFileToken-approveTransfer}.
     */
    function approveTransfer(uint256 tokenId, bytes calldata encryptedPassword) external {
        require(encryptedPassword.length > 0, "FilemarketCollectionV2: empty password");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(ownerOf(tokenId) == _msgSender(), "FilemarketCollectionV2: permission denied");
        require(info.publicKey.length != 0, "FilemarketCollectionV2: public key wasn't set yet");
        require(info.encryptedPassword.length == 0, "FilemarketCollectionV2: encrypted password was already set");
        info.encryptedPassword = encryptedPassword;
        info.passwordSetAt = block.timestamp;
        emit TransferPasswordSet(tokenId, encryptedPassword);
    }

    /**
     * @dev See {IEncryptedFileToken-finalizeTransfer}.
     */
    function finalizeTransfer(uint256 tokenId) external {
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(info.encryptedPassword.length != 0, "FilemarketCollectionV2: encrypted password wasn't set yet");
        require(!info.fraudReported, "FilemarketCollectionV2: fraud was reported");
        require(info.to == _msgSender() ||
        (info.passwordSetAt + finalizeTransferTimeout < block.timestamp && info.from == _msgSender()), "FilemarketCollectionV2: permission denied");
        _safeTransfer(ownerOf(tokenId), info.to, tokenId, info.data);
        if (address(info.callbackReceiver) != address(0)) {
            info.callbackReceiver.transferFinished(tokenId);
        }
        delete transfers[tokenId];
        emit TransferFinished(tokenId);
    }

    /**
     * @dev See {IEncryptedFileToken-reportFraud}.
     */
    function reportFraud(
        uint256 tokenId,
        bytes calldata privateKey
    ) external {
        require(privateKey.length > 0, "FilemarketCollectionV2: private key is empty");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(info.to == _msgSender(), "FilemarketCollectionV2: permission denied");
        require(info.encryptedPassword.length != 0, "FilemarketCollectionV2: encrypted password wasn't set yet");
        require(!info.fraudReported, "FilemarketCollectionV2: fraud was already reported");

        info.fraudReported = true;
        (bool decided, bool approve) = fraudDecider_.decide(tokenId,
            tokenUris[tokenId], info.publicKey, privateKey, info.encryptedPassword);
        require(fraudLateDecisionEnabled || decided, "FilemarketCollectionV2: late decision disabled");
        emit TransferFraudReported(tokenId);

        if (decided) {
            if (address(info.callbackReceiver) != address(0)) {
                info.callbackReceiver.transferFraudDetected(tokenId, approve);
            }
            if (!approve) {
                _safeTransfer(ownerOf(tokenId), info.to, tokenId, info.data);
            }
            delete transfers[tokenId];
            emit TransferFraudDecided(tokenId, approve);
        }
    }

    /**
     * @dev See {IEncryptedFileToken-applyFraudDecision}.
     */
    function applyFraudDecision(
        uint256 tokenId,
        bool approve
    ) external {
        require(fraudLateDecisionEnabled, "FilemarketCollectionV2: late decision disabled");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(_msgSender() == address(fraudDecider_), "FilemarketCollectionV2: permission denied");
        require(info.fraudReported, "FilemarketCollectionV2: fraud was not reported");
        if (address(info.callbackReceiver) != address(0)) {
            info.callbackReceiver.transferFraudDetected(tokenId, approve);
        }
        bytes memory data = info.data;
        address to = info.to;
        delete transfers[tokenId];
        if (!approve) {
            _safeTransfer(ownerOf(tokenId), to, tokenId, data);
        }

        emit TransferFraudDecided(tokenId, approve);
    }

    /**
     * @dev See {IEncryptedFileToken-cancelTransfer}.
     */
    function cancelTransfer(
        uint256 tokenId
    ) external {
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "FilemarketCollectionV2: transfer for this token wasn't created");
        require(!info.fraudReported, "FilemarketCollectionV2: fraud reported");
        require(_msgSender() == ownerOf(tokenId) || (info.to == address(0) && _msgSender() == info.initiator) ||
        (info.publicKeySetAt + finalizeTransferTimeout < block.timestamp && info.passwordSetAt == 0 && info.to == _msgSender()),
            "FilemarketCollectionV2: permission denied");
        if (address(info.callbackReceiver) != address(0)) {
            info.callbackReceiver.transferCancelled(tokenId);
        }
        delete transfers[tokenId];
        emit TransferCancellation(tokenId);
    }

    /// @dev function for transferring minting rights for collection
    function transferOwnership(address to) public virtual override onlyAccessToken {
        _transferOwnership(to);
    }

    function safeTransferFrom(address, address, uint256,
        bytes memory) public virtual override(ERC721Upgradeable, IERC721Upgradeable, IEncryptedFileTokenUpgradeableV2) {
        revert("common transfer disabled");
    }

    function safeTransferFrom(address, address,
        uint256) public virtual override(ERC721Upgradeable, IERC721Upgradeable, IEncryptedFileTokenUpgradeableV2) {
        revert("common transfer disabled");
    }

    function transferFrom(address, address,
        uint256) public virtual override(ERC721Upgradeable, IERC721Upgradeable, IEncryptedFileTokenUpgradeableV2) {
        revert("common transfer disabled");
    }

    function setRoyaltyReceiver(address newAddress) external onlyAccessToken {
        royaltyReceiver = newAddress;
    }

    function setFinalizeTransferTimeout(uint256 newTimeout) external onlyOwner {
        finalizeTransferTimeout = newTimeout;
    }

    function setSalesStartTimestamp(uint256 newTimestamp) external onlyOwner {
        salesStartTimestamp = newTimestamp;
    }

    /// @dev mint function for using in inherited contracts
    /// @param to - token receiver
    /// @param id - token id
    /// @param metaUri - metadata uri
    /// @param data - additional token data
    /// @param royalty - royalty
    function _mint(address to, uint256 id, string memory metaUri, bytes memory data, uint256 royalty) internal {
        require(royalty <= ROYALTY_CEILING, "FilemarketCollectionV2: royalty too high");
        tokensCount++;
        _safeMint(to, id);
        tokenUris[id] = metaUri;
        tokenData[id] = data;
        royalties[id] = royalty;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) public view override returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "ERC2981Royalties: Token does not exist");
        royaltyAmount = (salePrice * royalties[tokenId]) / PERCENT_MULTIPLIER;
        return (royaltyReceiver, royaltyAmount);
    }

    modifier onlyAdmin {
        require(admin == msg.sender, "Caller is not an admin");
        _;
    }

    function setAdmin(address newAdmin) public onlyAdmin {
        admin = newAdmin;
    }

    function setMintFee(uint256 _mintFee) public onlyAdmin {
        mintFee = _mintFee;
    }

    function setMintFeeReceiver(address _mintFeeReceiver) public onlyAdmin {
        mintFeeReceiver = _mintFeeReceiver;
    }
}