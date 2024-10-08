//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract SoundScaffold is ERC721, ERC721URIStorage, Ownable {

  event SongUploaded(uint256 indexed songId, string artist, string genre, string title);
  event PatronizeMusician(address patron, address artist, uint256 value, uint256 indexed songId);
  event PatronizeProject(address patron, uint256 value);
  event OwnerWithdraw(address indexed owner, uint256 amount);

  mapping(address => string) public artistNames;
  mapping(address => uint256[]) public artistSongs;
  uint256 public nextTokenId = 0;

  constructor() ERC721("Sound Scaffold", "SONG") {}

  function registerAccount(string calldata _artistName) external {
    require(bytes(artistNames[msg.sender]).length == 0, "Artist name already registered");
    artistNames[msg.sender] = _artistName;
  }

  function accountExists(address _user) public view returns(bool) {
    if(bytes(artistNames[_user]).length > 0) {
      return true;
    }
    return false;
  }

  function contribute(address payable _artist, uint256 _songId) payable public {
    require(msg.value > 0, "Contribution must be greater than 0");
    (bool sent, ) = _artist.call{value: msg.value}("");
    require(sent, "Failed to send Ether");
    emit PatronizeMusician(msg.sender, _artist, msg.value, _songId);
  }


  function getSongs(address _artist) public view returns(uint256[] memory) {
    return artistSongs[_artist];
  }

  function _baseURI() internal pure override returns (string memory) {
		return "https://ipfs.io/ipfs/";
	}

  function mintItem(address to, string memory uri, string memory genre, string memory title) public payable returns (uint256) {
      nextTokenId++;
      uint256 tokenId = nextTokenId;

      _safeMint(to, tokenId);
      _setTokenURI(tokenId, uri);
      artistSongs[to].push(tokenId);
      emit SongUploaded(tokenId, artistNames[to], genre, title);
      return tokenId;
  }


    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available to withdraw");

        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
        emit OwnerWithdraw(owner(), balance);
    }

  // required overrides
	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 quantity
	) internal override(ERC721) {
		super._beforeTokenTransfer(from, to, tokenId, quantity);
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721URIStorage)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}

  receive() payable external {
    emit PatronizeProject(msg.sender, msg.value);
  }
}