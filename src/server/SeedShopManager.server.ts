import { ReplicatedStorage } from "@rbxts/services";

const SeedShopTimer = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("SeedShopTimer") as RemoteEvent;
const ResetSeedShop = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("ResetSeedShop") as RemoteEvent;

interface CropData {
	IsInStock: boolean;
	StockAmount: number;
}

interface CropTable {
	[cropName: string]: CropData;
}

function FormatTime(Seconds: number): string {
	const Minutes = math.floor(Seconds / 60);
	const SecondsRemaining = Seconds - (Minutes * 60);
	const SecondsString = SecondsRemaining < 10 ? "0" + tostring(SecondsRemaining) : tostring(SecondsRemaining);
	return `${Minutes}:${SecondsString}`;
}

function IsInStock(chance: number): boolean {
	return math.random(1, 100) <= chance;
}

function PickCrops(): CropTable {
	return {
		["Carrot"]: {
			IsInStock: true,
			StockAmount: math.random(5, 25),
		},
		["Blueberry"]: {
			IsInStock: IsInStock(80),
			StockAmount: math.random(1, 8),
		},
		["Watermelon"]: {
			IsInStock: IsInStock(30),
			StockAmount: math.random(1, 5),
		},
		["Bamboo"]: {
			IsInStock: IsInStock(20),
			StockAmount: math.random(5, 25),
		},
		["Eggplant"]: {
			IsInStock: IsInStock(5),
			StockAmount: math.random(1, 3),
		},
	};
}

function UpdateShop(): void {
	const NewCrops = PickCrops();
	ResetSeedShop.FireAllClients(NewCrops);
}

task.spawn(() => {
	UpdateShop();

	while (true) {
		for (let i = 10; i >= 0; i--) {
			const TimeLeft = FormatTime(i);
			SeedShopTimer.FireAllClients(TimeLeft);
			task.wait(1);
		}
		UpdateShop();
	}
});
