require("dotenv").config({ path: "./.env" });
const configs = require("./config")
const { EthersRpcService } = require("../service/ethers_rpc");

exports.getConfig = () => {
    if (!process.env.CHAIN_ID) throw 'Missing CHAIN_ID'
    let chainConfig = configs['config' + process.env.CHAIN_ID]
    let provider = EthersRpcService(chainConfig)
    return {
        chainConfig,
        provider
    }
}