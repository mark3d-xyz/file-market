// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "./IFraudDecider.sol";
import "./IEncryptedFileToken.sol";
import "./IEncryptedFileTokenCallbackReceiver.sol";

contract PublicCollection is IEncryptedFileToken, ERC721Enumerable, Ownable, IERC2981 {
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

    address public constant defaultAdmin = 0xe99328545212e55A12c7142c6696B0B1adC5AE9c;

    uint256 public constant PERCENT_MULTIPLIER = 10000;
    uint256 public constant ROYALTY_CEILING = 5000;            // 50%

    address public admin;
    uint256 public mintFee;
    address public mintFeeReceiver;
    bytes public collectionData;                               // collection additional data
    string private contractMetaUri;                            // contract-level metadata
    mapping(uint256 => string) public tokenUris;               // mapping of token metadata uri
    mapping(uint256 => bytes) public tokenData;                // mapping of token additional data
    mapping(uint256 => uint256) public royalties;              // mapping of token to royalty
    address public royaltyReceiver;
    uint256 public tokensCount;                                // count of minted tokens
    mapping(uint256 => TransferInfo) private transfers;        // transfer details
    mapping(uint256 => uint256) public transferCounts;         // count of transfers per transfer
    bool private fraudLateDecisionEnabled;                     // false if fraud decision is instant
    IFraudDecider private fraudDecider_;                       // fraud decider
    uint256 public finalizeTransferTimeout;                    // Time before transfer finalizes automatically
    uint256 private salesStartTimestamp;                       // Time when users can start transfer tokens

    /// @dev construct
    /// @param name - name of the token
    /// @param symbol - symbol of the token
    /// @param _contractMetaUri - contract-level metadata uri
    /// @param _owner - collection creator
    /// @param _royaltyReceiver - address that will receive royalty
    /// @param _data - additional collection data
    /// @param _fraudDecider - fraud decider instance
    /// @param _fraudLateDecisionEnabled - if fraud decision is not instant
    constructor(
        string memory name,
        string memory symbol,
        string memory _contractMetaUri,
        address _owner,
        address _royaltyReceiver,
        bytes memory _data,
        IFraudDecider _fraudDecider,
        bool _fraudLateDecisionEnabled
    ) ERC721(name, symbol) {
        admin = defaultAdmin;
        mintFeeReceiver = admin;
        tokensCount = 0;
        contractMetaUri = _contractMetaUri;
        collectionData = _data;
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
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IEncryptedFileToken).interfaceId ||
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
    ) external payable {
        require(bytes(metaUri).length > 0, "PublicCollection: empty meta uri");
        require(msg.value >= mintFee, "PublicCollection: Insufficient minting fee");

        _mint(to, id, metaUri, _data, royalty);
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
    ) external payable returns (uint256) {
        require(bytes(metaUri).length > 0, "PublicCollection: empty meta uri");
        require(msg.value >= mintFee, "PublicCollection: Insufficient minting fee");

        uint256 id = tokensCount;
        _mint(to, tokensCount, metaUri, _data, royalty);

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
        require(count == metaUris.length, "PublicCollection: metaUri list length must be equal to count");
        require(count == _data.length, "PublicCollection: _data list length must be equal to count");
        require(count == royalty.length, "PublicCollection: royalty list length must be equal to count");
        require(msg.value >= mintFee * count, "PublicCollection: Insufficient minting fee");

        uint256 id = tokensCount;
        for (uint256 i = 0; i < count; i++) {
            _mint(to, id, metaUris[i], _data[i], royalty[i]);
            id++;
        }
    }

    /// @dev burn function
    /// @param id - token id
    function burn(uint256 id) external {
        require(ownerOf(id) == _msgSender(), "PublicCollection: not an owner of token");
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
        require(_isApprovedOrOwner(_msgSender(), tokenId), "PublicCollection: caller is not token owner or approved");
        require(transfers[tokenId].initiator == address(0), "PublicCollection: transfer for this token was already created");
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
        require(_isApprovedOrOwner(_msgSender(), tokenId), "PublicCollection: caller is not token owner or approved");
        require(transfers[tokenId].initiator == address(0), "PublicCollection: transfer for this token was already created");
        require(owner() == _msgSender() || block.timestamp > salesStartTimestamp, "PublicCollection: transfer can't be done before sales start day");
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
        require(publicKey.length > 0, "PublicCollection: empty public key");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(_msgSender() == info.initiator, "PublicCollection: permission denied");
        require(info.to == address(0), "PublicCollection: draft already complete");
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
        require(publicKey.length > 0, "PublicCollection: empty public key");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(info.to == _msgSender(), "PublicCollection: permission denied");
        require(info.publicKey.length == 0, "PublicCollection: public key was already set");
        require(transferNumber == transferCounts[tokenId], "PublicCollection: the transfer is not the latest transfer of this token");
        info.publicKey = publicKey;
        info.publicKeySetAt = block.timestamp;
        emit TransferPublicKeySet(tokenId, publicKey);
    }

    /**
     * @dev See {IEncryptedFileToken-approveTransfer}.
     */
    function approveTransfer(uint256 tokenId, bytes calldata encryptedPassword) external {
        require(encryptedPassword.length > 0, "PublicCollection: empty password");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(ownerOf(tokenId) == _msgSender(), "PublicCollection: permission denied");
        require(info.publicKey.length != 0, "PublicCollection: public key wasn't set yet");
        require(info.encryptedPassword.length == 0, "PublicCollection: encrypted password was already set");
        info.encryptedPassword = encryptedPassword;
        info.passwordSetAt = block.timestamp;
        emit TransferPasswordSet(tokenId, encryptedPassword);
    }

    /**
     * @dev See {IEncryptedFileToken-finalizeTransfer}.
     */
    function finalizeTransfer(uint256 tokenId) external {
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(info.encryptedPassword.length != 0, "PublicCollection: encrypted password wasn't set yet");
        require(!info.fraudReported, "PublicCollection: fraud was reported");
        require(info.to == _msgSender() ||
            (info.passwordSetAt + finalizeTransferTimeout < block.timestamp && info.from == _msgSender()), "PublicCollection: permission denied");
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
        require(privateKey.length > 0, "PublicCollection: private key is empty");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(info.to == _msgSender(), "PublicCollection: permission denied");
        require(info.encryptedPassword.length != 0, "PublicCollection: encrypted password wasn't set yet");
        require(!info.fraudReported, "PublicCollection: fraud was already reported");

        info.fraudReported = true;
        (bool decided, bool approve) = fraudDecider_.decide(tokenId,
            tokenUris[tokenId], info.publicKey, privateKey, info.encryptedPassword);
        require(fraudLateDecisionEnabled || decided, "PublicCollection: late decision disabled");
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
        require(fraudLateDecisionEnabled, "PublicCollection: late decision disabled");
        TransferInfo storage info = transfers[tokenId];
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(_msgSender() == address(fraudDecider_), "PublicCollection: permission denied");
        require(info.fraudReported, "PublicCollection: fraud was not reported");
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
        require(info.initiator != address(0), "PublicCollection: transfer for this token wasn't created");
        require(!info.fraudReported, "PublicCollection: fraud reported");
        require(_msgSender() == ownerOf(tokenId) || (info.to == address(0) && _msgSender() == info.initiator) ||
            (info.publicKeySetAt + finalizeTransferTimeout < block.timestamp && info.passwordSetAt == 0 && info.to == _msgSender()),
            "PublicCollection: permission denied");
        if (address(info.callbackReceiver) != address(0)) {
            info.callbackReceiver.transferCancelled(tokenId);
        }
        delete transfers[tokenId];
        emit TransferCancellation(tokenId);
    }

    /// @dev function for transferring minting rights for collection
    function transferOwnership(address to) public virtual override onlyOwner {
        _transferOwnership(to);
    }

    function safeTransferFrom(address, address, uint256,
        bytes memory) public virtual override(ERC721, IERC721, IEncryptedFileToken) {
        revert("common transfer disabled");
    }

    function safeTransferFrom(address, address,
        uint256) public virtual override(ERC721, IERC721, IEncryptedFileToken) {
        revert("common transfer disabled");
    }

    function transferFrom(address, address,
        uint256) public virtual override(ERC721, IERC721, IEncryptedFileToken) {
        revert("common transfer disabled");
    }

    function setRoyaltyReceiver(address newAddress) external onlyOwner {
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
        require(royalty <= ROYALTY_CEILING, "PublicCollection: royalty too high");
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

    function withdraw(address payable receiver) public onlyAdmin {
        (bool sent,) = receiver.call{value: address(this).balance}("");
        require(sent, "PublicCollection: failed to withdraw");
    }
}
