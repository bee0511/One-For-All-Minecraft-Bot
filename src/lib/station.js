const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
const pTimeout = require('p-timeout');      //?®æ?å¼„æ??™å€?
const containerOperation = require(`../lib/containerOperation`);
const mcFallout = require("../services/minecraft");
const pathfinder = require(`../lib/pathfinder`);
const { Vec3 } = require('vec3')
const v = require('vec3')
const wait = () => new Promise(setImmediate)
const { once } = require('events')
const station = {
    checkSupport: function (bot, stationConfig, target) {
        let sup = station.getIndexOF(stationConfig, target)
        return sup === -1 ? false : true;
    },
    getIndexOF: function (stationConfig, target) {
        for (let fIMI_i = 0; fIMI_i < stationConfig.materials.length; fIMI_i++) {
            if (stationConfig.materials[fIMI_i][0] == target) {
                //findItemMaterialsIndex = fIMI_i;
                return fIMI_i
            }
        }
        return -1
    },
    restock: async function (bot, stationConfig, RS_obj_array) {
        await this.oldrestock(bot, stationConfig, RS_obj_array)
    },
    newrestock: async function (bot, stationConfig, RS_obj_array) {
        const mcData = require('minecraft-data')(bot.version)
        console.log(stationConfig)
        console.log(RS_obj_array)
        // å°‡å‚³?????†æ?æª¢æŸ¥å¯«åœ¨?§éƒ¨
        //await mcFallout.promiseTeleportServer(bot,stationConfig.stationServer,15_000)
        //await sleep(1000)
        let inventoryFull = false
        for (let index = 0; index < RS_obj_array.length; index++) {
            await st_restock_single(stationConfig, RS_obj_array[index].name, RS_obj_array[index].count)
        }
        async function st_restock_single(stationConfig, restockid, quantity) {
            let remain = quantity
            let mt_cfg = station.getIndexOF(stationConfig, restockid)
            //console.log(stationConfig)
            //openContainerWithTimeout
            //check server
            await mcFallout.promiseTeleportServer(bot, stationConfig.stationServer, 15_000)
            //console.log(stationConfig.materials[mt_cfg])
            if (mt_cfg != -1) {  //?–å‡º ?–æ”¾?žå???
                let boxPos = new Vec3(stationConfig.materials[mt_cfg][1][0], stationConfig.materials[mt_cfg][1][1], stationConfig.materials[mt_cfg][1][2])
                let standOffest = v(stationConfig.offset[stationConfig.materials[mt_cfg][1][3]])
                let btnOffset = v(stationConfig.offset[stationConfig.materials[mt_cfg][1][4]])
                let standPos = boxPos.plus(standOffest)
                let btnPos = boxPos.plus(btnOffset)
                //

                if (quantity >= 0) {
                    if (standPos.distanceTo(bot.entity.position) > 100) {
                        console.log("distance too far, warp to station");
                        console.log(`warp to ${stationConfig.stationWarp}`);
                        await mcFallout.warp(bot, stationConfig.stationWarp, 3000)
                        await sleep(1000);
                    }
                    let trys = 0;
                    q: while (trys++ < 7) {
                        if (remain == 0) break;
                        let shulker_box
                        let b = 1;
                        while (!shulker_box && b++ < 4) {
                            //console.log(mt)
                            await pathfinder.astarfly(bot, standPos, null, null, null, true)
                            await sleep(50)
                            await pathfinder.astarfly(bot, standPos, null, null, null, true)
                            if (bot.blockAt(boxPos).name == 'air') {
                                await bot.activateBlock(bot.blockAt(btnPos));
                                await sleep(300);
                            }
                            shulker_box = await containerOperation.openContainerWithTimeout(bot, boxPos, 200 + 100 * b);
                            b++;
                        }
                        if (!shulker_box) {
                            console.log(`?‹å??’å? ${restockid} å¤±æ?`, boxPos)
                            continue q;
                        } else {
                            let tmpRemain = await containerOperation.withdraw(bot, shulker_box, restockid, remain, false, 0)
                            console.log(tmpRemain)
                            if (tmpRemain == -2) {
                                console.log("?’å?ç©ºä? é»žå??‰é?")
                                await bot.activateBlock(bot.blockAt(btnPos));
                                await bot.waitForTicks(8);
                            } else if (tmpRemain == -1) {  //full
                                remain = 0
                                break q;
                            } else {
                                remain = tmpRemain;
                            }
                            if (remain > 0) await bot.waitForTicks(15);
                            console.log(shulker_box.title)
                            console.log(restockid, remain, shulker_box.countRange(0, 26, mcData.itemsByName[restockid].id, null))
                            await shulker_box.close();
                        }
                    }
                } else {
                    if (standPos.distanceTo(bot.entity.position) > 100) {
                        console.log("distance too far, warp to station");
                        console.log(`warp to ${stationConfig.stationWarp}`);
                        await mcFallout.warp(bot, stationConfig.stationWarp, 3000)
                        await sleep(1000);
                    }
                    remain = bot.inventory.countRange(bot.inventory.inventoryStart, bot.inventory.inventoryEnd, mcData.itemsByName[restockid].id, null)
                    let shulker_box
                    let b = 1;
                    while (!shulker_box && b++ < 4) {
                        //console.log(mt)
                        await pathfinder.astarfly(bot, standPos, null, null, null, true)
                        await sleep(50)
                        await pathfinder.astarfly(bot, standPos, null, null, null, true)
                        shulker_box = await containerOperation.openContainerWithTimeout(bot, boxPos, 200 + 100 * b);
                        b++;
                    }
                    if (!shulker_box) {
                        console.log(`?‹å??’å? ${restockid} å¤±æ?`, boxPos)
                    } else {
                        let tmpRemain = await containerOperation.deposit(bot, shulker_box, restockid, -1, false)
                        console.log(tmpRemain)
                        await shulker_box.close();
                        if (tmpRemain == -1) {

                        } else if (tmpRemain > 0) {
                            remain = tmpRemain;
                        } else {
                            remain = 0;
                        }
                    }
                    mt_cfg = -1;
                }
                //await sleep(400)

            }
            if (mt_cfg == -1 && remain != 0) {  //?¾å…¥overfull
                remain = bot.inventory.countRange(bot.inventory.inventoryStart, bot.inventory.inventoryEnd, mcData.itemsByName[restockid].id, null)
                console.log(restockid, remain, '?¾å…¥overfull')
                let boxPos = new Vec3(stationConfig.overfull[0], stationConfig.overfull[1], stationConfig.overfull[2])
                let standOffest = v(stationConfig.offset[stationConfig.overfull[3]])
                let btnOffset = v(stationConfig.offset[stationConfig.overfull[4]])
                let standPos = boxPos.plus(standOffest)
                let btnPos = boxPos.plus(btnOffset)
                if (standPos.distanceTo(bot.entity.position) > 100) {
                    console.log("distance too far, warp to station");
                    console.log(`warp to ${stationConfig.stationWarp}`);
                    await mcFallout.warp(bot, stationConfig.stationWarp, 3000)
                    await sleep(1000);
                }
                let shulker_box
                let b = 1;
                while (!shulker_box && b++ < 4) {
                    //console.log(mt)
                    await pathfinder.astarfly(bot, standPos, null, null, null, true)
                    await sleep(50)
                    await pathfinder.astarfly(bot, standPos, null, null, null, true)
                    shulker_box = await containerOperation.openContainerWithTimeout(bot, boxPos, 200 + 100 * b);
                    b++;
                }
                if (!shulker_box) {
                    console.log(`?‹å??’å? overfull å¤±æ?`, boxPos)
                } else {
                    let tmpRemain = await containerOperation.deposit(bot, shulker_box, restockid, -1, false)
                    console.log(tmpRemain)
                    await shulker_box.close();
                    // if(tmpRemain>0){
                    //     remain = tmpRemain;
                    // }else{
                    //     remain = 0;
                    // }
                }
            }
            //console.log('witho',restockid, quantity)
        }
    },
    oldrestock: async function (bot, stationConfig, RS_obj_array) {
        for (let index = 0; index < RS_obj_array.length; index++) {
            // console.log(RS_obj_array[index].name,RS_obj_array[index].count)
            await st_restock_single(stationConfig, RS_obj_array[index].name, RS_obj_array[index].count)
        }
        async function st_restock_single(stationConfig, restockid, quantity) {
            let findItemMaterialsIndex = -1;
            let remain = quantity;
            for (let fIMI_i = 0; fIMI_i < stationConfig.materials.length; fIMI_i++) {
                if (stationConfig.materials[fIMI_i][0] == restockid) {
                    findItemMaterialsIndex = fIMI_i;
                    break;
                }
            }
            await mcFallout.promiseTeleportServer(bot, stationConfig.stationServer, 15_000)
            //console.log(findItemMaterialsIndex);
            let shulkerBox_loc = v(stationConfig.materials[findItemMaterialsIndex][1]);
            let botton_loc;
            let standPos;
            let stand_dirc_offset = stationConfig.offset[stationConfig.materials[findItemMaterialsIndex][1][3]];
            let botton_dirc_offset = stationConfig.offset[stationConfig.materials[findItemMaterialsIndex][1][4]];
            if (stand_dirc_offset == undefined || botton_dirc_offset == undefined) {
                console.log(`station ${stationConfig.stationName} missing offset for ${restockid}`);




                bot.gkill(202)
                if (bot.blockAt(shulkerBox_loc.offset(-1, 0, 0)).name.indexOf('comparator') != -1) {
                    standPos = shulkerBox_loc.offset(-3, 1, 0);
                    botton_loc = shulkerBox_loc.offset(-2, 1, 0);
                }
                else if (bot.blockAt(shulkerBox_loc.offset(1, 0, 0)).name.indexOf('comparator') != -1) {
                    standPos = shulkerBox_loc.offset(3, 1, 0);
                    botton_loc = shulkerBox_loc.offset(2, 1, 0);
                }
                else if (bot.blockAt(shulkerBox_loc.offset(0, 0, -1)).name.indexOf('comparator') != -1) {
                    standPos = shulkerBox_loc.offset(0, 1, -3);
                    botton_loc = shulkerBox_loc.offset(0, 1, -2);
                }
                else if (bot.blockAt(shulkerBox_loc.offset(0, 0, 1)).name.indexOf('comparator') != -1) {
                    standPos = shulkerBox_loc.offset(0, 1, 3);
                    botton_loc = shulkerBox_loc.offset(0, 1, 2);
                }
            } else {
                standPos = shulkerBox_loc.offset(stand_dirc_offset[0], stand_dirc_offset[1], stand_dirc_offset[2]);
                botton_loc = shulkerBox_loc.offset(botton_dirc_offset[0], botton_dirc_offset[1], botton_dirc_offset[2]);
            }
            if (standPos.distanceTo(bot.entity.position) > 100) {
                console.log("distance too far, warp to station");
                console.log(`warp to ${stationConfig.stationWarp}`);
                await mcFallout.warp(bot, stationConfig.stationWarp, 3000)
                await sleep(1000);
            }
            await pathfinder.astarfly(bot, standPos, null, null, null, false)
            await sleep(200);
            //console.log('?®æ?é»žè???)
            //console.log(standPos.distanceTo(bot.entity.position));
            while (standPos.distanceTo(bot.entity.position) > 2) {
                bot._client.write("abilities", {
                    flags: 2,
                    flyingSpeed: 4.0,
                    walkingSpeed: 4.0
                })
                await sleep(200);
                await pathfinder.astarfly(bot, standPos, null, null, null, true)
                await sleep(200);
                await pathfinder.astarfly(bot, standPos, null, null, null, true)
            }
            if (quantity == -1) {
                let shu;
                let maxTryTime = 0;
                let success_open = false;
                while (maxTryTime++ < 5) {
                    if(!bot.blockAt(shulkerBox_loc)){
                        await sleep(1000)
                        //wait loading
                        continue
                    }
                    if (bot.blockAt(shulkerBox_loc)?.name == 'air') {
                        await bot.activateBlock(bot.blockAt(botton_loc));
                        await sleep(300);
                    }
                    try {
                        shu = await pTimeout(bot.openBlock(bot.blockAt(shulkerBox_loc)), 1000);
                        success_open = true;
                        console.log("container opened");
                        break;
                    } catch (e) {
                        console.log("open container failed");
                        await sleep(100);
                    }
                }
                if (success_open && shu.title.includes("è·Ÿæ‚¨ç¢ºè?ä»¶ä?")) {
                    console.log('é»žæ?å®¹å™¨?Œæ?è¦ç?')
                    await bot.simpleClick.leftMouse(30)
                }
                if (success_open) {
                    remain = await containerOperation.deposit(bot, shu, restockid, -1, false);
                    shu.close();
                }
                else remain = -1;
                if (remain > 0 || remain == -1) {
                    let overfull_shu_loc = v(stationConfig.overfull);
                    let overfull_botton_loc;
                    let overfull_standPos;
                    let ofstand_dirc_offset = stationConfig.offset[stationConfig.materials[findItemMaterialsIndex][1][3]];
                    let ofbotton_dirc_offset = stationConfig.offset[stationConfig.materials[findItemMaterialsIndex][1][4]];
                    if (ofstand_dirc_offset == undefined || ofbotton_dirc_offset == undefined) {
                        if (bot.blockAt(overfull_shu_loc.offset(-1, 0, 0)).name.indexOf('comparator') != -1) {
                            overfull_standPos = overfull_shu_loc.offset(-3, 1, 0);
                            overfull_botton_loc = overfull_shu_loc.offset(-2, 1, 0);
                        }
                        else if (bot.blockAt(overfull_shu_loc.offset(1, 0, 0)).name.indexOf('comparator') != -1) {
                            overfull_standPos = overfull_shu_loc.offset(3, 1, 0);
                            overfull_botton_loc = overfull_shu_loc.offset(2, 1, 0);
                        }
                        else if (bot.blockAt(overfull_shu_loc.offset(0, 0, -1)).name.indexOf('comparator') != -1) {
                            overfull_standPos = overfull_shu_loc.offset(0, 1, -3);
                            overfull_botton_loc = overfull_shu_loc.offset(0, 1, -2);
                        }
                        else if (bot.blockAt(overfull_shu_loc.offset(0, 0, 1)).name.indexOf('comparator') != -1) {
                            overfull_standPos = overfull_shu_loc.offset(0, 1, 3);
                            overfull_botton_loc = overfull_shu_loc.offset(0, 1, 2);
                        }
                    } else {
                        overfull_standPos = shulkerBox_loc.offset(ofstand_dirc_offset[0], ofstand_dirc_offset[1], ofstand_dirc_offset[2]);
                        overfull_botton_loc = shulkerBox_loc.offset(ofbotton_dirc_offset[0], ofbotton_dirc_offset[1], ofbotton_dirc_offset[2]);
                    }
                    await pathfinder.astarfly(bot, overfull_standPos, null, null, null, true);
                    await sleep(50)
                    await pathfinder.astarfly(bot, overfull_standPos, null, null, null, true)
                    success_open = false, maxTryTime = 0;
                    while (maxTryTime++ < 5) {
                        try {
                            let bl = bot.blockAt(overfull_shu_loc)
                            if (bl == null) {
                                await pathfinder.astarfly(bot, overfull_standPos, null, null, null, true);
                                await sleep(50)
                                continue
                            }
                            shu = await pTimeout(bot.openBlock(bl), 1000);
                            success_open = true;
                            console.log("container opened");
                            break;
                        } catch (e) {
                            console.log("open container failed");
                            await sleep(100);
                        }
                    }
                    if (!success_open) return;
                    else {
                        remain = await containerOperation.deposit(bot, shu, restockid, -1, false);
                        shu.close();
                    }
                }
                //console.log(remain);
            } else {
                let maxTryTime = 0;
                ii: while (maxTryTime++ < 10) {
                    // console.log("maxtry: ",maxTryTime)
                    if (remain <= 0) break;
                    let success_open = false;
                    if (bot.blockAt(shulkerBox_loc)?.name == 'air') {
                        await bot.activateBlock(bot.blockAt(botton_loc));
                        await sleep(300);
                    }
                    let shu;
                    try {
                        let bl = bot.blockAt(shulkerBox_loc)
                        if (bl == null) {
                            await pathfinder.astarfly(bot, standPos, null, null, null, true);
                            await sleep(2000)
                            continue
                        }
                        shu = await pTimeout(bot.openBlock(bl), 1000);
                        success_open = true;
                        console.log("container opened");
                    } catch (e) {
                        console.log("open container failed");
                        await sleep(1000);
                        continue ii
                    }
                    if (success_open&&shu.title.includes("è·Ÿæ‚¨ç¢ºè?ä»¶ä?")) {
                        console.log('é»žæ?å®¹å™¨?Œæ?è¦ç?')
                        await bot.simpleClick.leftMouse(30)
                    }
                    if (success_open) {
                        console.log("?å?ä¸?..")
                        let tempremain = await containerOperation.withdraw(bot, shu, restockid, remain, false, 0);
                        shu.close();
                        if (tempremain == -2) {
                            console.log("?’å?ç©ºä? é»žå??‰é?")
                            await bot.activateBlock(bot.blockAt(botton_loc));
                            await bot.waitForTicks(8);
                        } else {
                            remain = tempremain;
                        }
                        if (remain > 0) await bot.waitForTicks(15);
                    }
                }

            }
        }

    }
}
module.exports = station 
