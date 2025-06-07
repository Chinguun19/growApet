import { TweenService, Workspace, ServerScriptService, ServerStorage, RunService, PathfindingService, PhysicsService } from "@rbxts/services";
import { Rare } from "./Modules/ScaleRarity";
import { CollectionService } from "@rbxts/services";

interface AnimalModule {
    growAnimal: (cropName: string, plr: Player, pos: Vector3, properties: AnimalProperties, seed: Tool) => void;
    // [Other methods]
}

interface AnimalProperties {
	Multiplier: number;
	Modifier?: string;
}

interface ScalableModel extends Model {
	ScaleTo(scale: number): void;
}

interface PenBounds {
	Min: Vector3;
	Max: Vector3;
}

enum AnimalState {
	Idle,
	Moving,
	Eating,
}

interface AnimalMovementData {
	currentState: AnimalState;
	lastStateChange: number;
	currentTween?: Tween;
	targetPosition?: Vector3;
	isMoving: boolean;
	nextUpdateTime: number;
}


const HATCH_TIME = 2; // Seconds for egg hatching
const GROWTH_TIME = 10; // Increased for gradual scaling
const EGG_SCALE = 2;

const ts = TweenService;
const tf = new TweenInfo(4, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1, false);
const pf = PathfindingService;

const WALK_SPEED = 8;
const SAFETY_MARGIN = 4;
const UPDATE_INTERVAL = 0.5;
const MAX_CONCURRENT_MOVEMENTS = 10;
const BOUNDS_UPDATE_INTERVAL = 30;
const MOVETO_TIMEOUT = 8;
const MIN_STATE_DURATION = 1;
const MAX_PATHFIND_RETRIES = 3;

// State weights
const stateWeights = new Map<AnimalState, number>([
	[AnimalState.Idle, 30],
	[AnimalState.Moving, 60],
	[AnimalState.Eating, 10],
]);

const stateDurations = new Map<AnimalState, [number, number]>([
	[AnimalState.Idle, [2, 4]],
	[AnimalState.Moving, [2, 4]],
	[AnimalState.Eating, [3, 6]],
]);

// Storage for movement data
const animalData = new Map<Tool, AnimalMovementData>();
const penCache = new Map<Model, { bounds: PenBounds; lastUpdate: number; floorPart?: BasePart }>();
let heartbeatConnection: RBXScriptConnection | undefined;


function FindPen(id: number): Model | undefined {
    for (const pen of Workspace.WaitForChild("Plots").GetChildren()) {
        if (pen.GetAttribute("USERID") === id) {
            return pen as Model;
        }
    }
    return undefined;
}

function GiveAnimal(player: Player, tool: Tool): void {
	print(`🎒 Giving animal ${tool.Name} to player ${player.Name}`);
	const backpack = player.WaitForChild("Backpack");
	tool.Parent = backpack;
	print(`✅ Tool ${tool.Name} parented to ${player.Name}'s Backpack`);


		

}

function AddPrompt(mainAnimal: Model, distance: number, animalTool: Tool): void {
	print(`AddPrompt called for ${mainAnimal.Name}`);

	const newPrompt = new Instance("ProximityPrompt");
	// Changed ActionText to be more descriptive
	newPrompt.ActionText = "Harvest";
	newPrompt.ObjectText = mainAnimal.Name;
	newPrompt.MaxActivationDistance = distance;
	newPrompt.RequiresLineOfSight = false;

	if (mainAnimal?.PrimaryPart) {
		newPrompt.Parent = mainAnimal.PrimaryPart;
	} else {
		warn(`Model ${mainAnimal.Name} does not have a PrimaryPart for the prompt.`);
		return;
	}

	newPrompt.Triggered.Connect((player: Player) => {
		print(`Prompt triggered by: ${player.Name}`);

		// --- NEW LOGIC START ---

		// 1. Get the player's character and currently equipped tool
		const character = player.Character;
		const equippedTool = character?.FindFirstChildOfClass("Tool");

		// 2. Check if the player is holding the correct harvester tool
		if (!equippedTool || equippedTool.GetAttribute("IsHarvester") !== true) {
			print(`❌ Harvest failed: ${player.Name} is not holding a harvester tool.`);
			// Optional: you could send a notification to the player here.
			return;
		}

		print(`✅ Player ${player.Name} is holding a valid harvester tool.`);

		// 3. Check if the player is the owner of the animal
		const itemOwner = mainAnimal.Parent?.GetAttribute("USERID") as number;
		print(`Item owner UserId: ${itemOwner}, Triggering player UserId: ${player.UserId}`);

		if (itemOwner === player.UserId) {
			print("✅ Owner match! Harvesting animal.");
			newPrompt.Destroy();
            mainAnimal.Destroy();
			GiveAnimal(player, animalTool); // Give the animal *item* tool
			print(`Gave ${animalTool.Name} to player.`);
		} else {
			print("❌ Owner mismatch. Harvest ignored.");
		}
		// --- NEW LOGIC END ---
	});
}



function scaleEgg(model: Model, scaleFactor: number, tweenInfo: TweenInfo, ts: TweenService) {
    const origin = model.GetPivot().Position;

    for (const part of model.GetDescendants()) {
        if (part.IsA("BasePart")) {
            const offset = part.Position.sub(origin).mul(scaleFactor);
            const newSize = part.Size.mul(scaleFactor);
            const newPos = origin.add(offset);
            ts.Create(part, tweenInfo, {
                Size: newSize,
                Position: newPos
            }).Play();
        }
    }
}

function scaleModelGradually(
	model: Model,
	targetScale: number,
	duration: number,
	textLabel?: TextLabel
): Promise<void> {
	return new Promise((resolve) => {
    print(`Scaling ${model} to ${targetScale}, duration: ${duration}`)
		if (!model || !model.IsA("Model")) return resolve();

		const scalableModel = model as unknown as { GetScale: (self: unknown) => number };
		const startScale = scalableModel.GetScale!(scalableModel);
		if (!startScale) return resolve();

		const steps = 30;
		const delayTime = duration / steps;
		const scaleIncrement = (targetScale - startScale) / steps;

		let currentScale = startScale;

		task.spawn(() => {
			for (let i = 1; i <= steps; i++) {
				currentScale += scaleIncrement;
				model.ScaleTo(currentScale);

				if (textLabel && textLabel.Parent) {
					const percent = math.floor((i / steps) * 100);
					textLabel.Text = `Growing: ${percent}%`;
				}

				wait(delayTime);
			}

			if (textLabel && textLabel.Parent) {
				textLabel.Text = "Fully Grown!";
				task.delay(2, () => textLabel.Parent?.Destroy());
			}

			resolve(); // ✅ Notify that growth is finished
		});
	});
}



function setCollisionGroup(model: Model, groupName: string) {
  
    for (const part of model.GetDescendants()) {
        if (part.IsA("BasePart")) {
            part.CollisionGroup = groupName
        }
    }
}




const AnimalModule: AnimalModule = {
  growAnimal: (
    cropName: string,
    plr: Player,
    pos: Vector3,
    properties: AnimalProperties,
    seed: Tool
  ): void => {
    print(`📦 Starting growAnimal: cropName=${cropName}, player=${plr.Name}`);
    print(properties)
    const plot = FindPen(plr.UserId);
    if (!plot) {
      warn(`❌ No plot found for player: ${plr.Name}`);
      return;
    }

    const Eggs = ServerStorage.WaitForChild("Eggs") as Folder;
    const Animals = ServerStorage.WaitForChild("Animals") as Folder;

    const eggTemplate = Eggs.FindFirstChild(`${cropName}`) as Model;
    const animalTemplate = Animals.FindFirstChild(cropName) as Model;

    if (!eggTemplate) {
      warn(`❌ Egg model not found for: ${cropName}Egg`);
      return;
    }

    if (!animalTemplate) {
      warn(`❌ Animal model not found for: ${cropName}`);
      return;
    }

    print(`✅ Found egg and animal models for ${cropName}`);

    const egg = eggTemplate.Clone();
    egg.Name = `${cropName}_Egg`;
    egg.Parent = plot;

    const adjustedPos = pos.add(new Vector3(0, 1, 0));
    egg.PivotTo(new CFrame(adjustedPos));

    const tweenInfo = new TweenInfo(
      HATCH_TIME,
      Enum.EasingStyle.Linear,
      Enum.EasingDirection.InOut
    );

    scaleEgg(egg, EGG_SCALE, tweenInfo, ts);

    const billboardGui = new Instance("BillboardGui");
    billboardGui.Size = new UDim2(2, 0, 1, 0);
    billboardGui.StudsOffset = new Vector3(0, 3, 0);
    billboardGui.AlwaysOnTop = true;
    billboardGui.Parent = egg;

    const textLabel = new Instance("TextLabel");
    textLabel.Size = new UDim2(1, 0, 1, 0);
    textLabel.BackgroundTransparency = 0.5;
    textLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
    textLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
    textLabel.TextScaled = true;
    textLabel.Text = "Hatching: 1%";
    textLabel.Parent = billboardGui;

    task.spawn(() => {
      const startTime = tick();

      while (tick() - startTime < HATCH_TIME && egg.Parent) {
        const progress = math.clamp((tick() - startTime) / HATCH_TIME, 0, 1);
        const percentage = math.floor(progress * 100);
        textLabel.Text = `Hatching: ${percentage}%`;
        task.wait(0.1);
      }

      textLabel.Text = "Hatched!";
      egg.Destroy();

      // Clone animal after egg is destroyed
      const animal = animalTemplate.Clone();
      setCollisionGroup(animal, "Animals");
      animal.Name = cropName;
      animal.Parent = plot;
      animal.PivotTo(new CFrame(adjustedPos.add(new Vector3(0, 0.5, 0))));
      animal.SetAttribute("Mutation", properties.Modifier);
      animal.SetAttribute("TargetScaling", properties.Multiplier)

      const defaultValue = (animal.GetAttribute("DEFAULT_VALUE") as number) || 30;

      print("Base:", properties.Multiplier, "Multiplier:", properties.Modifier, defaultValue); 
      const animalTool = new Instance("Tool");
      animalTool.Name = cropName;
      animalTool.SetAttribute("SellingPrice", defaultValue * properties.Multiplier);
      animalTool.SetAttribute("Scale", properties.Multiplier);
      animalTool.SetAttribute("Modifier", properties.Modifier || "None");
      animalTool.SetAttribute("USERID", plr.UserId);
      CollectionService.AddTag(animalTool, "Egg")

      print(animalTool.GetAttribute("SellingPrice"))
      // Add UI to the new animal
      const growthGui = billboardGui.Clone();
      growthGui.Parent = animal;

      const growthLabel = growthGui.FindFirstChildOfClass("TextLabel") as TextLabel;
      if (growthLabel) {
        growthLabel.Text = "Growing: 1%";
      }

      // Call the improved scaling function
      scaleModelGradually(
        animal,
        properties.Multiplier,
        animal.GetAttribute("GROWTH_TIME") as number || GROWTH_TIME,
        growthLabel
      );
         
      task.wait(animal.GetAttribute("GROWTH_TIME") as number || GROWTH_TIME);
      AddPrompt(animal as Model, 10, animalTool);

    });
  }
};


export = AnimalModule;

