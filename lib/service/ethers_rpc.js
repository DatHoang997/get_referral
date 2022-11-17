"use strict";
require("dotenv").config({ path: "./.env" });
const { JsonRpcProvider } = require("@ethersproject/providers");
const { AssistedJsonRpcProvider } = require("assisted-json-rpc-provider");

exports.EthersRpcService = (config) => {
    return new AssistedJsonRpcProvider(
        new JsonRpcProvider({
            timeout: 6000,
            url: config.RPC_URL,
        }),
        {
            rateLimitCount: config.RPC_RATE_LIMIT_COUNT,
            rateLimitDuration: config.RPC_RATE_LIMIT_DURATION,
            rangeThreshold: config.RPC_RANGETHRESHOLD,
            maxResults: config.RPC_MAX_RESULTS,
            url: config.RPC_SCANURL,
            apiKeys: config.RPC_APIKEYS,
        },
    );
};
