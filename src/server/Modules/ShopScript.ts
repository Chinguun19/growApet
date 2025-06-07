import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

// Get references
const plr = Players.LocalPlayer;
const playerGui = plr.WaitForChild("PlayerGui") as PlayerGui;
const shopGui = playerGui.WaitForChild("Shops") as ScreenGui;
const shop = shopGui.WaitForChild("Frame") as Frame;
const closeShopButton = shop.WaitForChild("CloseShop") as TextButton;

const SeedShop = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("SeedShop") as RemoteEvent;
const SeedShopTimer = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("SeedShopTimer") as RemoteEvent;
const BuyCrop = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("BuyCrop") as RemoteEvent;
const ResetSeedShop = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("ResetSeedShop") as RemoteEvent;

// Require TextConcat module
const TextConcat = require(ReplicatedStorage.WaitForChild("TextConcat") as ModuleScript) as {
	new: (label: TextLabel, text: string) => void;
};

// Interface for crop properties from server
interface CropProperties {
	IsInStock: boolean;
	StockAmount: number;
}

interface CropTable {
	[cropName: string]: CropProperties;
}

// SeedShop remote event
SeedShop.OnClientEvent.Connect((label: TextLabel) => {
	label.Visible = true;
	label.Text = "";
	TextConcat.new(label, "Here are the seeds that are in stock");
	
	task.wait(1.5);
	
	label.Visible = false;
	label.Text = "";
	shop.Visible = true;
});

// Close shop button
closeShopButton.MouseButton1Click.Connect(() => {
	shop.Visible = false;
});

// Timer update
SeedShopTimer.OnClientEvent.Connect((timeLeft: string) => {
	const timerLabel = shop.WaitForChild("Timer") as TextLabel;
	timerLabel.Text = "New Seeds in: " + timeLeft;
});

// Tween setup
const ts = TweenService;
const tf = new TweenInfo(2, Enum.EasingStyle.Linear, Enum.EasingDirection.In, -1, false);
const tfstop = new TweenInfo(1, Enum.EasingStyle.Sine, Enum.EasingDirection.Out, 0, false);

// Get crop frames and set up interactions
const scrollingFrame = shop.WaitForChild("ScrollingFrame") as ScrollingFrame;
const cropFrames = scrollingFrame.GetChildren();

for (const cropFrame of cropFrames) {
	if (cropFrame.IsA("Frame")) {
		const frame = cropFrame as Frame;
		
		// Get seed for rotation animation
		const seedImage = frame.WaitForChild("SeedImage") as Frame;
		const viewportFrame = seedImage.WaitForChild("ViewportFrame") as ViewportFrame;
		const seed = viewportFrame.WaitForChild("Seed") as BasePart;
		
		const tween = ts.Create(seed, tf, {
			Orientation: new Vector3(0, 360, 0)
		});
		
		// Mouse enter/leave events for animation
		frame.MouseEnter.Connect(() => {
			tween.Play();
		});
		
		frame.MouseLeave.Connect(() => {
			tween.Pause();
		});
		
		// Buy button functionality
		const buyFrame = frame.WaitForChild("BuyFrame") as Frame;
		const buyButton = buyFrame.WaitForChild("BuyButton") as TextButton;
		
		buyButton.MouseButton1Click.Connect(() => {
			const price = frame.GetAttribute("Price") as number;
			const stockAmount = frame.GetAttribute("StockAmount") as number;
			
			const leaderstats = plr.WaitForChild("leaderstats") as Folder;
			const cash = leaderstats.WaitForChild("Cash") as IntValue;
			
			if (cash.Value >= price && stockAmount > 0) {
				BuyCrop.FireServer(frame.Name, price);
				
				const newStock = stockAmount - 1;
				frame.SetAttribute("StockAmount", newStock);
				
				const seedStock = frame.WaitForChild("SeedStock") as TextLabel;
				seedStock.Text = tostring(newStock) + "X Stock";
			}
		});
	}
}

// Reset seed shop event
ResetSeedShop.OnClientEvent.Connect((cropTable: CropTable) => {
	for (const [cropName, cropProperties] of pairs(cropTable)) {
		const cropFrame = scrollingFrame.FindFirstChild(cropName) as Frame;
		
		if (cropFrame) {
			const seedStock = cropFrame.WaitForChild("SeedStock") as TextLabel;
			seedStock.Text = tostring(cropProperties.StockAmount) + "X Stock";
			
			cropFrame.SetAttribute("StockAmount", cropProperties.StockAmount);
			cropFrame.SetAttribute("InStock", cropProperties.IsInStock);
		}
	}
});