require("dotenv").config({ path: "./.env" });
const configs = require("./config")
const constant = require("./constants")
const { EthersRpcService } = require("../service/ethers_rpc");

exports.getConfig = () => {
    if (!process.env.CHAIN_ID) throw 'Missing CHAIN_ID'
    if (!process.env.EVENT) throw 'Missing EVENT'
    let chainConfig = configs['config' + process.env.CHAIN_ID]
    let provider = EthersRpcService(chainConfig)
    let event = constant[process.env.EVENT]
    return {
        chainConfig,
        provider,
        event
    }
}