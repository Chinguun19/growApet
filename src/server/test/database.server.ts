import { DataStoreService } from "@rbxts/services";
import { Players } from "@rbxts/services";


const playerDataStore = DataStoreService.GetDataStore("PlayerDataTest_V2"); // Use a new version to avoid old data conflicts


function printTable(data: unknown, indent = "") {
	if (type(data) !== "table") {
		print(indent + tostring(data));
		return;
	}

	for (const [key, value] of pairs(data as object)) {
		if (type(value) === "table") {
			print(`${indent}${key}:`);
			printTable(value, indent + "  ");
		} else {
			print(`${indent}${key}: ${value}`);
		}
	}
}


const inventory = [
	{ name: "Cow", sellingPrice: 50, scale: 1.2, modifier: "None" },
	{ name: "Pig", sellingPrice: 35, scale: 1.0, modifier: "FastGrow" },
];


const success = pcall(() => {
	playerDataStore.SetAsync("Centillion19", {
		cash: 100,
		inventory: inventory,
	});
});


if (success) {
    print(`[✅] Successfully saved data for Centillion19`);
}

const [success2, data] = pcall(() => {
    const result = playerDataStore.GetAsync("Centillion19");
    return (result as LuaTuple<[unknown, DataStoreKeyInfo]>)[0];
});
if (success2 && data) {
    print(`[✅] Successfully loaded data for Centillion19: ${data});`);
	printTable(data);
} else {
    warn(`[⚠️] Could not load data for Centillion19. Reason: ${data}`);
}