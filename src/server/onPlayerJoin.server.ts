import { Players, Workspace, ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { Rare } from "./Modules/ScaleRarity";
import AnimalModule from "./simpleGrowthManager";
import { PhysicsService } from "@rbxts/services";

// import ScaleRarity, {CropName} from "server/ScaleRarity";
// import SeedModule from "server/GrowthManager";

const TeleportEvent = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("Teleport") as RemoteEvent;
const BuyCropEvent = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("BuyCrop") as RemoteEvent;
const PlantSeedEvent = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("PlantSeed") as RemoteEvent;

const plotsFolder = Workspace.FindFirstChild("Plots");
const plots = plotsFolder?.GetChildren().filter((child) => child.IsA("Model")) ?? [];

function setCollisionGroup(model: Model, groupName: string) {
  
    for (const part of model.GetDescendants()) {
        if (part.IsA("BasePart")) {
            part.CollisionGroup = groupName
        }
    }
}



Players.PlayerAdded.Connect((plr) => {
	 plr.CharacterAdded.Connect((character) => {
	   setCollisionGroup(character, "Players");
	 },);

	const leaderstats = new Instance("Folder");
	leaderstats.Name = "leaderstats";
	leaderstats.Parent = plr;

	const cash = new Instance("IntValue");
	cash.Name = "Cash";
	cash.Value = 1000000;
	cash.Parent = leaderstats;

	for (const plot of plots) {
		const taken = plot.GetAttribute("Taken");
		if (!taken) {
			plot.SetAttribute("Taken", true);
			plot.SetAttribute("USERID", plr.UserId);
			print(`${plr.Name} has taken ${plot.Name}`);

			const sign = plot.WaitForChild("PlayerSign") as Model;
			const mainPart = sign.FindFirstChild("Main") as BasePart | undefined;
			if (!mainPart) continue;

			const gui = mainPart.FindFirstChildOfClass("SurfaceGui") as SurfaceGui | undefined;
			if (!gui) continue;

			const textLabel = gui.FindFirstChild("TextLabel") as TextLabel | undefined;
			if (textLabel) {
				textLabel.Text = `${plr.Name}'s Garden`;
			}

			const imageLabel = new Instance("ImageLabel");
            imageLabel.Position = new UDim2(0.6, 0, 0, 0);
            imageLabel.Size = new UDim2(0.4, 0, 1, 0);
            imageLabel.Parent = gui;
            
            
			if (imageLabel) {
				imageLabel.ImageTransparency = 0;

				const [content, isReady] = Players.GetUserThumbnailAsync(
					plr.UserId,
					Enum.ThumbnailType.HeadShot,
					Enum.ThumbnailSize.Size420x420,
				);
				imageLabel.Image = isReady ? content : "";
			}

			break;
		}
	}
});

Players.PlayerRemoving.Connect((plr) => {
	for (const plot of plots) {
		if (plot.GetAttribute("USERID") === plr.UserId) {
			plot.SetAttribute("USERID", "");
			plot.SetAttribute("Taken", false);

			const sign = plot.WaitForChild("PlayerSign") as Model;
			const imgLabel = (sign.FindFirstChild("Main") as BasePart)
				.FindFirstChild("SurfaceGui")!
				.FindFirstChild("ImageLabel") as ImageLabel;

			imgLabel.ImageTransparency = 1;
		}
	}
});

// Teleport

TeleportEvent.OnServerEvent.Connect((plr, ...args: unknown[]) => {
	const position = args[0] as Vector3;
	const char = plr.Character;
	if (char) {
		const root = char.FindFirstChild("HumanoidRootPart") as BasePart;
		if (root) {
			root.Position = position;
		}
	}
});

// // Buy Crop


BuyCropEvent.OnServerEvent.Connect((plr: Player, ...args: unknown[]) => {
	// Input validation
	if (args.size() < 2) return;
	
	const cropName = args[0] as string;
	const price = args[1] as number;
	
	// Validate inputs
	if (typeOf(cropName) !== "string" || typeOf(price) !== "number") return;
	if (price <= 0) return;
	
	const leaderstats = plr.FindFirstChild("leaderstats");
	if (!leaderstats) return;
	
	const cash = leaderstats.FindFirstChild("Cash") as IntValue;
	if (!cash || cash.Value < price) return;

	// Deduct money
	cash.Value -= price;

	// Give seed
	const eggName = `${cropName} Egg`;
	const cropEggs = ServerStorage.FindFirstChild("AnimalEggs");
	if (!cropEggs) return;
	
	const seedTemplate = cropEggs.FindFirstChild(eggName) as Tool;
	if (!seedTemplate) return;

	const backpack = plr.FindFirstChild("Backpack");
	if (!backpack) return;

	const seed = seedTemplate.Clone();
	seed.Parent = backpack;
	
	// Optional: Add feedback
	print(`${plr.Name} bought ${eggName} for ${price} cash`);
});

// // Plant Seed
PlantSeedEvent.OnServerEvent.Connect((plr: Player, ...args: unknown[]) => {
	const [seedRaw, posRaw] = args;

	// Type checking
	if (!typeIs(seedRaw, "Instance") || !typeIs(posRaw, "Vector3")) return;

	const seed = seedRaw;
	const pos = posRaw;
	print(`Planting seed at ${pos} for player ${plr.Name}`);
	if (!seed.IsA("Tool")) return;

	const cropName = seed.GetAttribute("Name") as string | undefined;
	if (!cropName) return;

	seed.Destroy();
	print(cropName)
	const cloned = (ServerStorage.WaitForChild("AnimalEggs") as Folder)
		.FindFirstChild(`${cropName} Egg`)?.Clone();

	const properties = Rare.PickRandom(cropName) as { Multiplier: number; Modifier?: string } | undefined;
	if (cloned && cloned.IsA("Tool") && properties) {
		
		
		
		const cropModel = cloned as Tool;
		AnimalModule.growAnimal(cropName, plr, pos, properties, seed);
	}
});

