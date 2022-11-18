"use strict";

const constants = require("../helpers/constants.js");
const { utils } = require("ethers");
const fs = require("fs");
const rawData = require("../../rawData.json");

const originAddress = "0x0000000000000000000000000000000000000000";

exports.swappedConsumer = async (config, toBlock = undefined) => {
    let lastestBlock = await config.provider.getBlock("latest");
    let fromBlock = 16000000;
    if (!toBlock) toBlock = lastestBlock.number;

    fromBlock = getFromBlock(fromBlock);
    getLogs(config, fromBlock, toBlock);
};

const getLogs = async (config, fromBlock, toBlock) => {
    const filter = {
        address: config.chainConfig.factories,
        topics: [
            "0xbd99c6719f088aa0abd9e7b7a4a635d1f931601e9f304b538dc42be25d8c65c6",
        ],
        fromBlock,
        toBlock,
    };
    let data = await config.provider.getLogs(filter);

    decodeLogs(data);
};

const getFromBlock = (fromBlock) => {
    let arr = [];
    Object.keys(rawData).forEach((element) => {
        arr.push(rawData[element][1]);
    });
    if (arr.length > 0) {
        fromBlock = Math.max(...arr);
        return fromBlock;
    }
    return fromBlock;
};

const decodeLogs = async (logs) => {
    let referralData = {};
    let iface = new utils.Interface(constants.Iface.swappedIface);
    for (let log of logs) {
        const logParsed = iface.parseLog(log);
        let senderAddress = logParsed.args.dstReceiver;
        let referral = logParsed.args.referral;
        let blockNumber = log.blockNumber;
        if (senderAddress == originAddress) continue;
        await buildTree(senderAddress, blockNumber, referral, referralData);
    }
    fs.writeFileSync(
        "rawData.json",
        JSON.stringify(referralData),
        (error) => {},
    );
    formatData(referralData);
};

const buildTree = async (
    senderAddress,
    blockNumber,
    referral,
    referralData,
) => {
    if (referral == senderAddress) {
        referralData[senderAddress] = [originAddress, blockNumber];
        return;
    }
    referralData[senderAddress] = [referral, blockNumber];
    return;
};

const formatData = (data) => {
    let firstLevel = getFirstLevel(data);
    let tree = getChildLoop(
        firstLevel.result[originAddress],
        firstLevel.level1Address,
        data,
    );

    saveToFile(tree);
};

const getChildLoop = (father, fatherArray, data) => {
    Object.keys(data).forEach((key) => {
        if (data[key][0] != originAddress) {
            if (father.length > 1) {
                let findInTopArray = fatherArray.find(
                    (element) => element == data[key][0],
                );
                if (!findInTopArray) {
                    father.push(data[key]);
                    fatherArray.push(data[key][0]);
                }
            }
            for (let e of father) {
                if (data[key][0] == e[0]) {
                    e.push([key, data[key][1]]);
                    if (e.length > 2) {
                        getChildLoop([e[e.length - 1]], fatherArray, data);
                    }
                }
            }
        }
    });
    return father;
};

const saveToFile = (data) => {
    fs.writeFileSync("data.json", JSON.stringify(data), (error) => {});
};

const getFirstLevel = (data) => {
    let result = {};
    let level1 = [];
    let level1Address = [];
    Object.keys(data).forEach((key) => {
        if (data[key][0] == originAddress) {
            level1.push([key, data[key][1]]);
            level1Address.push(key);
        }
    });
    result[originAddress] = level1;
    return { result, level1Address };
};
