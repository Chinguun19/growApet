// // Located in: ServerScriptService/PlayerDataManager.ts

// import { Players, ServerStorage, DataStoreService } from "@rbxts/services";
// import { PlayerData, InventoryItemData, AnimalProperties } from "server/types/PlayerData"; // Assuming your types are here

// // --- SETUP ---
// const playerDataStore = DataStoreService.GetDataStore("PlayerDataTest_V2"); // Use a new version to avoid old data conflicts
// const playerDataCache = new Map<Player, PlayerData>();

// // A function to create default data for a new player
// function createDefaultData(player: Player): PlayerData {
//     print(`[✅] Creating new default profile for ${player.Name}`);
//     return {
//         userId: player.UserId,
//         cash: 100, // A more reasonable starting cash
//         inventory: [], // Starts with an empty inventory
//         AnimalProperties: [],

//         lastLogoutTime: os.time(),
//     };
// }


// // --- 1. LOAD DATA WHEN PLAYER JOINS ---
// Players.PlayerAdded.Connect((player) => {
//     const userId = tostring(player.UserId);

//     // Load data from the DataStore
//     const [success, data] = pcall(() => {
//         const result = playerDataStore.GetAsync("Player_" + userId);
//         return (result as LuaTuple<[unknown, DataStoreKeyInfo]>)[0] as PlayerData | undefined;
//     });

//     let playerData: PlayerData;
//     if (success && data) {
//         // Player has existing data, so we load it
//         playerData = data;
//         print(`[✅] Successfully loaded data for ${player.Name}`);
//     } else {
//         // No data found or an error occurred, so create new data
//         warn(`[⚠️] Could not load data for ${player.Name}. Reason: ${data}. Creating new profile.`);
//         playerData = createDefaultData(player);
//     }

//     // Store the loaded/new data in our session cache
//     playerDataCache.set(player, playerData);

//     // --- Create in-game objects from the loaded data (like leaderstats) ---
//     const leaderstats = new Instance("Folder");
//     leaderstats.Name = "leaderstats";
//     leaderstats.Parent = player;

//     const cash = new Instance("NumberValue");
//     cash.Name = "Cash";
//     cash.Value = playerData.cash; // Set cash from loaded data
//     cash.Parent = leaderstats;
// });


// // --- 2. SAVE DATA WHEN PLAYER LEAVES ---
// Players.PlayerRemoving.Connect((player) => {
// 	const userId = tostring(player.UserId);

//     // Retrieve the player's data from our session cache
//     const playerData = playerDataCache.get(player);

//     // If for some reason we have no data, we can't save anything
//     if (!playerData) {
//         warn(`[⚠️] No data found in cache for ${player.Name}. Cannot save.`);
//         return;
//     }

// 	// --- THIS IS THE "TODO" PART: Update the cached data with current game state ---
//     print(`[🔄] Syncing latest game state for ${player.Name} before saving...`);

//     // 1. Update cash from leaderstats
//     const leaderstats = player.FindFirstChild("leaderstats");
//     const cash = leaderstats?.FindFirstChild("Cash") as NumberValue;
//     if (cash) {
//         playerData.cash = cash.Value;
//     }

//     // 2. Update inventory from Backpack (and Character for equipped tools)
//     playerData.inventory = []; // Clear old inventory before re-populating
//     const backpack = player.FindFirstChild("Backpack");
//     const backpackTools = backpack && backpack.IsA("Backpack") ? backpack.GetChildren() : [];
//     const characterTools = player.Character ? player.Character.GetChildren() : [];
//     const tools = [...backpackTools, ...characterTools];
//     for (const item of tools) {
//         if (item.IsA("Tool")) {
//             const inventoryItem: InventoryItemData = {
//                 name: item.Name,
//                 // Add any other attributes you want to save from the tool
//                 sellingPrice: item.GetAttribute("SellingPrice") as number | undefined,
//                 scale: item.GetAttribute("Scale") as number | undefined
//             };
//             playerData.inventory.push(inventoryItem);
//         }
//     }

//     // 3. Update growing animals (This would call your AnimalModule)
//     // playerData.growingAnimals = AnimalModule.getGrowingAnimalsForSave(player);

// 	// 4. Update the logout timestamp
//     playerData.lastLogoutTime = os.time();

//     // Now, save the UPDATED playerData object
// 	const [success, err] = pcall(() => {
// 		return playerDataStore.SetAsync("Player_" + userId, playerData);
// 	});

// 	if (success) {
// 		print(`[💾] Saved data for ${player.Name}`);
// 	} else {
// 		warn(`[⚠️] Failed to save data for ${player.Name}: ${err}`);
// 	}

//     // Clean up the cache to free memory
//     playerDataCache.delete(player);
// });