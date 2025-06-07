// import { PlayerData } from "./types/PlayerData";
// import { DataStoreService } from "@rbxts/services";
// import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";
// import { AnimalProperties } from "./types/PlayerData";
// import { InventoryItemData } from "./types/PlayerData";

// function getPlayerPlot(player: Player): Model | undefined {
// 	const plotsFolder = Workspace.FindFirstChild("Plots") as Folder;
// 	return plotsFolder?.FindFirstChild(player.Name) as Model;
// }

// function getAnimalsFromPlot(player: Player): Model[] {
// 	const plot = getPlayerPlot(player);
// 	if (!plot) return [];

// 	const animals: Model[] = [];
// 	for (const child of plot.GetChildren()) {
// 		if (child.IsA("Model") && child.GetAttribute("IsAnimal") === true) {
// 			animals.push(child);
// 		}
// 	}
// 	return animals;
// }

// function extractAnimalData(model: Model): AnimalProperties {
// 	const position = model.GetPivot().Position;
// 	return {
// 		animalName: model.Name,
// 		position: {
// 			x: position.X,
// 			y: position.Y,
// 			z: position.Z,
// 		},
// 		targetScale: model.GetAttribute("targetScale") as number,
// 		modifier: model.GetAttribute("modifier") as string,
// 		growthStartTime: model.GetAttribute("growthStartTime") as number,
// 		growthDuration: model.GetAttribute("growthDuration") as number,
// 	};
// }




// Players.PlayerRemoving.Connect((plr) => {
//    const plots = getPlayerPlot(plr)
//     const animalModels = getAnimalsFromPlot(plr);
//     const animalDataArray: AnimalProperties[] = [];
//     for (const model of animalModels) {
// 	if (model.GetAttribute("IsGrowing") === true) {
// 		const data = extractAnimalData(model);
// 		animalDataArray.push(data);
// 	}
// }

// const leaderstats = plr.FindFirstChild("leaderstats") as Folder;
// const cashValue = leaderstats?.FindFirstChild("Cash") as IntValue;

// const cash = cashValue ? cashValue.Value : 0;

// const backpack = plr.FindFirstChild("Backpack");
// const inventory: InventoryItemData[] = [];

// if (backpack) {
// 	for (const tool of backpack.GetChildren()) {
// 		if (tool.IsA("Tool")) {
// 			inventory.push({
// 				name: tool.Name,
// 				sellingPrice: tool.GetAttribute("SellingPrice") as number | undefined,
// 				scale: tool.GetAttribute("Scale") as number | undefined,
// 				modifier: tool.GetAttribute("Modifier") as string | undefined,
// 				isHarvester: tool.GetAttribute("IsHarvester") as boolean | undefined,
// 			});
// 		}
// 	}
// }

// const playerData: PlayerData = {
// 	userId: plr.UserId,
// 	cash: cash, // TODO: get from leaderstats
// 	inventory: inventory, // TODO: get from Backpack
// 	AnimalProperties: animalDataArray,
// 	lastLogoutTime: os.time(),
// };

// const playerDataStore = DataStoreService.GetDataStore("PlayerData");


// const [success, err] = pcall(() => {
// 	playerDataStore.SetAsync("Player_" + plr.UserId, playerData);
// });

// if (success) {
// 	print(`✅ Saved ${animalDataArray.size()} animals for ${plr.Name}`);
// } else {
// 	warn(`⚠️ Error saving animal data for ${plr.Name}: ${err}`);
// }


// });