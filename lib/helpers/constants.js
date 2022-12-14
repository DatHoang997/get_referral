exports.hexes = {
    ZERO_HASH:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    LARGE_VALUE:
        "0x8000000000000000000000000000000000000000000000000000000000000000",
};

exports.getlogs = {
    CHUNK_SIZE_HARD_CAP: 4000,
    TARGET_LOGS_PER_CHUNK: 500,
};

exports.swapped = {
    topic: [
        "0xbd99c6719f088aa0abd9e7b7a4a635d1f931601e9f304b538dc42be25d8c65c6",
    ],
    Iface: [
        "event Swapped(address indexed sender,address indexed srcToken,address indexed dstToken,address dstReceiver,uint256 amount,uint256 spentAmount,uint256 returnAmount,uint256 minReturnAmount,address referral)",
    ],
};
