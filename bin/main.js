"use strict";

require("dotenv").config({ path: "./.env" });
const { log } = require("stdio_log");
const { getConfig } = require("../lib/helpers/getConfig");
const { swappedConsumer } = require("../lib/service/swapped")

const main = async() => {
    log.info("start worker");
    let config = getConfig();
    await swappedConsumer(config)
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
});
