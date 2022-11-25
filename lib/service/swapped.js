"use strict";

const LocalStorage = require("node-localstorage").LocalStorage;
let rawDataStorage = new LocalStorage("./local_storage/rawData");
let tempDataStorage = new LocalStorage("./local_storage/tempData");
let blockDataStorage = new LocalStorage("./local_storage/blockData");
const { utils } = require("ethers");
const fs = require("fs");

const originAddress = "0x0000000000000000000000000000000000000000";

exports.swappedConsumer = async (config, toBlock = undefined) => {
    let latestBlock = await config.provider.getBlock("latest");
    let fromBlock = 16000000;
    if (!toBlock) toBlock = latestBlock.number;
    fromBlock = getFromBlock(fromBlock);
    if (toBlock - fromBlock > 0) {
        getLogs(config, fromBlock, toBlock);
        return;
    }
    if (toBlock - fromBlock <= 0) {
        getOldReferral(toBlock);
        return;
    }
};

const getLogs = async (config, fromBlock, toBlock) => {
    const filter = {
        address: config.chainConfig.factories,
        topics: config.event.topic,
        fromBlock,
        toBlock,
    };
    let data = await config.provider.getLogs(filter);
    decodeLogs(config.event.Iface, data);
};

const getFromBlock = (fromBlock) => {
    let latestBlock = blockDataStorage.getItem("latestBlock");
    if (latestBlock) {
        fromBlock = parseInt(latestBlock) + 1;
    }
    return fromBlock;
};

const getOldReferral = (block) => {
    for (let i = 0; i < rawDataStorage.length; i++) {
        let tempData = [];
        let items = JSON.parse(rawDataStorage.getItem(rawDataStorage.key(i)));
        if (items.length > 1) {
            for (let item of items) {
                if (item[1] <= block) {
                    tempData.push(item);
                }
            }
            if (tempData.length == 0) {
                continue;
            }
            tempDataStorage.setItem(
                rawDataStorage.key(i),
                JSON.stringify(tempData),
            );
        } else if (items[0][1] <= block) {
            tempDataStorage.setItem(
                rawDataStorage.key(i),
                JSON.stringify(items),
            );
        }
    }
    formatData(tempDataStorage);
};

const decodeLogs = (Iface, logs) => {
    let iface = new utils.Interface(Iface);
    for (let log of logs) {
        const logParsed = iface.parseLog(log);
        let senderAddress = logParsed.args.dstReceiver;
        let referral = logParsed.args.referral;
        let blockNumber = log.blockNumber;
        if (senderAddress == originAddress) continue;
        saveRawData(senderAddress, blockNumber, referral);
    }
    formatData(rawDataStorage);
};

const saveRawData = (senderAddress, blockNumber, referral) => {
    if (referral == senderAddress) {
        referral = originAddress;
    }

    if (referral != originAddress && !rawDataStorage.getItem(referral)) {
        rawDataStorage.setItem(
            referral,
            JSON.stringify([[originAddress, 16000000]]),
        );
    }

    let data = rawDataStorage.getItem(senderAddress);
    if (!data) {
        rawDataStorage.setItem(
            senderAddress,
            JSON.stringify([[referral, blockNumber]]),
        );
        return;
    }
    data = JSON.parse(data);
    if (referral != data[data.length - 1][0]) {
        data.push([referral, blockNumber]);
        rawDataStorage.setItem(senderAddress, JSON.stringify(data));
        blockDataStorage.setItem("latestBlock", blockNumber);
        return;
    }
    return;
};

const formatData = (data) => {
    let firstLevel = getFirstLevel(data);
    let tree = getChildLoop(
        firstLevel.result[originAddress],
        firstLevel.level1Address,
        data,
    );
    tempDataStorage.clear();
    saveToFile(tree);
};

const getChildLoop = (father, fatherArray, data) => {
    for (let i = 0; i < data.length; i++) {
        let key = data.key(i);
        let item = JSON.parse(data.getItem(data.key(i)));

        if (key != originAddress) {
            for (let e of father) {
                if (item[item.length - 1][0] == e[0]) {
                    e.push([data.key(i)]);
                    if (e.length > 2) {
                        getChildLoop([e[e.length - 1]], fatherArray, data);
                    }
                }
            }
        }
    }
    return father;
};

const saveToFile = (data) => {
    for (let displayData of data) {
        if (Number.isInteger(displayData[1])) {
            displayData.splice(1, 1);
        }
    }
    fs.writeFileSync("data.json", JSON.stringify(data), (error) => {
        console.log(error);
    });
};

const getFirstLevel = (data) => {
    let result = {};
    let level1 = [];
    let level1Address = [];
    for (let i = 0; i < data.length; i++) {
        let item = JSON.parse(data.getItem(data.key(i)));
        if (item[item.length - 1][0] == originAddress) {
            level1.push([data.key(i)]);
            level1Address.push(data.key(i), item[item.length - 1][1]);
        }
    }
    result[originAddress] = level1;

    return { result, level1Address };
};
