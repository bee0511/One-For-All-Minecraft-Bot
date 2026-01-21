const openPreventList = [
	"map",
	"filled_map",
	"bone",
	"stick",
	"golden_shovel",
	"fishing_rod",
];

async function openPreventSpecItem(bot) {
	//console.log(bot.heldItem);
	if (!bot.heldItem) return;
	if (openPreventList.includes(bot.heldItem.name)) {
		let findFirstCanSwapSlot = -1;
		for (let i = bot.inventory.inventoryStart; i < bot.inventory.slots.length; i++) {
			if (bot.inventory.slots[i] == null) {
				findFirstCanSwapSlot = i;
				break;
			} else if (openPreventList.indexOf(bot.inventory.slots[i].name) == -1) {
				findFirstCanSwapSlot = i;
				break;
			}
		}
		if (findFirstCanSwapSlot == -1) {
			console.log("沒有空位或可換位置，無法交換持有物品");
			return;
		} else {
			let ori_slot = bot.heldItem.slot;
			console.log(ori_slot);
			console.log(findFirstCanSwapSlot);
			await bot.clickWindow(ori_slot, 0, 0);
			await bot.waitForTicks(1);
			await bot.clickWindow(findFirstCanSwapSlot, 0, 0);
			await bot.waitForTicks(1);
			await bot.clickWindow(ori_slot, 0, 0);
			await bot.waitForTicks(1);
			console.log("交換完成");
		}
	}
}

module.exports = { openPreventSpecItem };
