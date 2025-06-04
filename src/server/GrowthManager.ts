import { TweenService, Workspace, ServerScriptService, ServerStorage } from "@rbxts/services";

interface AnimalModule {
	growAnimal: (animalName: string, player: Player, modelPosition: Vector3, properties: AnimalProperties) => void;
}

interface AnimalProperties {
	Scale: number;
	Modifier?: string;
}

interface ScalableModel extends Model {
	ScaleTo(scale: number): void;
}

const AnimalModule: AnimalModule = {} as AnimalModule;

const ts = TweenService;
const tf = new TweenInfo(4, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1, false);

import { Rare } from "./ScaleRarity";

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

    const model = tool.FindFirstChild("Model") as Model;
    if (!model || !model.PrimaryPart) {
        warn(`❌ Model or PrimaryPart not found in tool ${tool.Name}`);
        return;
    }

    model.PrimaryPart.Name = "Handle";
    model.PrimaryPart.Anchored = false;
    model.PrimaryPart.CanCollide = false;

    for (const part of model.GetDescendants()) {
        if (part.IsA("BasePart") && part !== model.PrimaryPart) {
            part.Anchored = false;
            part.CanCollide = false;
            part.Parent = tool;
        } else if (part.IsA("Folder") || part.IsA("StringValue") || part.IsA("BodyPosition")) {
            part.Destroy();
            print(`🛠️ Removed ${part.ClassName}: ${part.Name}`);
        } else if (part.IsA("Weld") || part.IsA("Constraint")) {
            part.Destroy();
            print(`🛠️ Removed ${part.ClassName}: ${part.Name}`);
        }
    }

    model.Parent = tool;

    tool.RequiresHandle = true;
    tool.CanBeDropped = true;
    tool.Enabled = true;

    const backpack = player.WaitForChild("Backpack");
    tool.Parent = backpack;
    print(`✅ Tool ${tool.Name} parented to ${player.Name}'s Backpack`);

    const character = player.Character;
    if (character) {
        const rightHand = character.FindFirstChild("RightHand") as BasePart;
        if (rightHand) {
            tool.Parent = character;
            model.PrimaryPart.PivotTo(rightHand.CFrame);
            print(`🖐️ Tool ${tool.Name} equipped to ${player.Name}'s RightHand`);
        }
    }

    if (model.Parent !== tool) {
        warn(`⚠️ Model ${model.Name} is not parented to tool, destroying`);
        model.Destroy();
    }
}

function AddPrompt(mainAnimal: Tool, distance: number, offspring?: Tool): void {
    print("AddPrompt called");
    print("Main Animal:", mainAnimal.Name);
    if (offspring) print("Offspring provided:", offspring.Name);
    print("Distance:", distance);

    const newPrompt = new Instance("ProximityPrompt");
    newPrompt.ActionText = "Catch";
    newPrompt.MaxActivationDistance = distance;
    newPrompt.RequiresLineOfSight = false;

    const model = offspring 
        ? offspring.FindFirstChild("Model") as Model 
        : mainAnimal.FindFirstChild("Model") as Model;

    if (!model) {
        warn(`❌ No model found in ${offspring ? `offspring (${offspring.Name})` : `mainAnimal (${mainAnimal.Name})`}`);
        return;
    }

    print("Model found:", model.Name);

    if (!model.PrimaryPart) {
        warn(`❌ Model "${model.Name}" in ${offspring ? `offspring (${offspring.Name})` : `mainAnimal (${mainAnimal.Name})`} does not have a PrimaryPart`);
        // Attempt to assign a PrimaryPart if possible
        const parts = model.GetChildren().filter((child) => child.IsA("BasePart")) as BasePart[];
        if (parts.size() > 0) {
            model.PrimaryPart = parts[0];
            print(`🛠️ Assigned ${parts[0].Name} as PrimaryPart for model "${model.Name}"`);
        } else {
            warn(`❌ No BaseParts found in model "${model.Name}" to assign as PrimaryPart`);
            return;
        }
    }

    print("PrimaryPart found:", model.PrimaryPart.Name);
    newPrompt.Parent = model.PrimaryPart;

    newPrompt.Triggered.Connect((player: Player) => {
        print("Prompt triggered by:", player.Name);
        const itemOwner = mainAnimal.Parent?.GetAttribute("USERID") as number;
        print("Item owner UserId:", itemOwner);
        print("Triggering player UserId:", player.UserId);

        if (itemOwner === player.UserId) {
            print("Owner match! Giving animal.");
            newPrompt.Destroy();

            if (offspring) {
                GiveAnimal(player, offspring);
                mainAnimal.SetAttribute("IsFull", false);
                print("Gave offspring and marked mainAnimal as not full.");
            } else {
                GiveAnimal(player, mainAnimal);
                print("Gave main animal.");
            }
        } else {
            print("Owner mismatch. Prompt ignored.");
        }
    });
}

function ScaleModel(model: Model, targetScale: number, duration: number, modelPosition: Vector3, offsetY: number): void {
    if (!model.PrimaryPart) {
        warn("❌ No PrimaryPart in model for scaling");
        return;
    }

    const initialScale = 0.1;
    const adjustedPosition = modelPosition.add(new Vector3(0, offsetY * targetScale, 0));
    const targetCFrame = new CFrame(adjustedPosition);

    if ("ScaleTo" in model) {
        const scalable = model as unknown as ScalableModel;
        scalable.ScaleTo(initialScale);
        model.PrimaryPart.CFrame = targetCFrame;
    }

    const tweenInfo = new TweenInfo(
        duration,
        Enum.EasingStyle.Quad,
        Enum.EasingDirection.Out,
        0,
        false,
        0
    );

    const scaleValue = new Instance("NumberValue");
    scaleValue.Value = initialScale;

    const scaleTween = ts.Create(scaleValue, tweenInfo, { Value: targetScale });

    scaleValue.GetPropertyChangedSignal("Value").Connect(() => {
        if (model.Parent && "ScaleTo" in model) {
            (model as unknown as ScalableModel).ScaleTo(scaleValue.Value);
            if (model.PrimaryPart) {
                model.PrimaryPart.CFrame = targetCFrame;
                print(`📍 Scaling update, position: ${model.PrimaryPart.CFrame.Position}`);
            }
        }
    });

    scaleTween.Completed.Connect(() => {
        scaleValue.Destroy();
        if (model.PrimaryPart) {
            model.PrimaryPart.CFrame = targetCFrame;
            print(`📍 Scaling complete, final position: ${model.PrimaryPart.CFrame.Position}`);
        }
        // Keep parts anchored to prevent falling
    });

    scaleTween.Play();
}

function TurnGold(tool: Tool): void {
    const model = tool.FindFirstChildOfClass("Model");
    if (!model) return;

    for (const part of model.GetDescendants()) {
        if (part.IsA("Part")) {
            (part as BasePart).Color = Color3.fromRGB(255, 207, 64);
        }
    }
    const currentPrice = tool.GetAttribute("SellingPrice") as number;
    tool.SetAttribute("SellingPrice", currentPrice * 20);
}

function TurnRainbow(tool: Tool): void {
    const model = tool.FindFirstChildOfClass("Model");
    if (!model) return;

    const hueValue = new Instance("NumberValue");
    const numTween = ts.Create(hueValue, tf, { Value: 1 });
    numTween.Play();

    for (const part of model.GetDescendants()) {
        if (part.IsA("Part")) {
            const basePart = part as BasePart;
            basePart.Color = Color3.fromHSV(0, 1, 1);
            hueValue.GetPropertyChangedSignal("Value").Connect(() => {
                basePart.Color = Color3.fromHSV(hueValue.Value, 1, 1);
            });
        }
    }
    const currentPrice = tool.GetAttribute("SellingPrice") as number;
    tool.SetAttribute("SellingPrice", currentPrice * 50);
}

function GetAnimalNum(spawnPosFolder: readonly Instance[]): number {
    let counter = 0;
    for (const folder of spawnPosFolder) {
        counter += folder.GetChildren().size();
    }
    return counter;
}

AnimalModule.growAnimal = (
    animalName: string,
    player: Player,
    modelPosition: Vector3,
    properties: AnimalProperties
): void => {
    print(`🚀 growAnimal called for ${animalName} with scale ${properties.Scale} by player ${player.Name}`);
    print(`📍 Planting at position: ${modelPosition}`);

    const CropModels = ServerStorage.WaitForChild("CropModels") as Folder;
    const animalTemplate = CropModels.FindFirstChild(animalName) as Tool;
    if (!animalTemplate) {
        warn(`❌ Animal template "${animalName}" not found in CropModels`);
        return;
    }

    const animalTool = animalTemplate.Clone();
    const model = animalTool.FindFirstChild("Model") as Model;
    if (!model) {
        warn(`❌ No Model found inside "${animalName}" tool`);
        animalTool.Destroy();
        return;
    }

    if (!model.PrimaryPart) {
        const parts = model.GetChildren().filter((child) => child.IsA("BasePart")) as BasePart[];
        if (parts.size() > 0) {
            model.PrimaryPart = parts[0];
            print(`🛠️ Assigned ${parts[0].Name} as PrimaryPart for model "${model.Name}"`);
        } else {
            warn(`❌ No BaseParts found in model "${model.Name}" to assign as PrimaryPart`);
            animalTool.Destroy();
            return;
        }
    }

    for (const part of model.GetDescendants()) {
        if (part.IsA("BasePart")) {
            (part as BasePart).Anchored = true;
            (part as BasePart).CanCollide = false;
        }
    }

    const offsetY = 2.5;
    const adjustedPosition = modelPosition.add(new Vector3(0, offsetY * properties.Scale, 0));
    model.PivotTo(new CFrame(adjustedPosition));
    print(`📍 Model positioned at: ${model.PrimaryPart.CFrame.Position}`);

    const growthTime = (animalTool.GetAttribute("GROWTH_TIME") as number) || 2;
    const defaultValue = (animalTool.GetAttribute("DEFAULT_VALUE") as number) || 100;
    const USERID = (animalTool.GetAttribute("USERID") as number) || player.UserId;
    print(`${animalTool}, 👤 USERID: ${USERID}`);
    print(`🔧 Growth time: ${growthTime}s, Default value: ${defaultValue}`);

    const pen = FindPen(player.UserId);
    animalTool.Parent = pen ?? Workspace;
    print(`📦 Animal placed inside ${pen ? "player's pen" : "Workspace"}`);

    animalTool.SetAttribute("SellingPrice", defaultValue * properties.Scale);

    if (properties.Modifier === "Gold") {
        print("✨ Gold modifier applied");
        TurnGold(animalTool);
    } else if (properties.Modifier === "Rainbow") {
        print("🌈 Rainbow modifier applied");
        TurnRainbow(animalTool);
    }

    print(`🌱 Starting growth for ${animalTool.Name}`);

    task.spawn(() => {
        ScaleModel(model, properties.Scale, growthTime, modelPosition, offsetY);
        task.wait(growthTime + 0.5);
        print(`✅ ${animalTool.Name} finished growing`);
        if (model.PrimaryPart) {
            print(`📍 Final position after growth: ${model.PrimaryPart.CFrame.Position}`);
        }

        if (animalTool.HasTag("Breeding")) {
            print(`🐣 ${animalTool.Name} is a breeding animal`);

            while (animalTool.Parent) {
                task.wait(5);

                if (animalTool.GetAttribute("IsFull") === true) {
                    print("🚫 Pen is full, skipping spawn");
                    continue;
                }

                const spawnPositionsFolder = model.FindFirstChild("SpawnPositions");
                if (!spawnPositionsFolder) {
                    warn("⚠️ No SpawnPositions found");
                    continue;
                }

                const spawnPositions = spawnPositionsFolder.GetChildren();
                if (spawnPositions.size() === 0) {
                    warn("⚠️ No available spawn positions");
                    continue;
                }

                let ranPos: Instance | undefined;
                do {
                    const randomIndex = math.random(0, spawnPositions.size() - 1);
                    ranPos = spawnPositions[randomIndex];
                } while (ranPos && ranPos.FindFirstChildOfClass("Tool"));

                if (!ranPos) {
                    warn("⚠️ Could not find empty spawn position");
                    continue;
                }

                print(`🎯 Found spawn position: ${ranPos.Name}`);

                const offspringFolder = ServerStorage.FindFirstChild("Offspring");
                const offspringTemplate = offspringFolder?.FindFirstChild(animalTool.Name);

                let offspring: Tool;
                if (!offspringTemplate) {
                    print("👶 Using parent template for offspring");
                    offspring = animalTemplate.Clone();
                } else {
                    print("👶 Using specific offspring template");
                    offspring = offspringTemplate.Clone() as Tool;
                    offspring.SetAttribute("USERID", animalTool.GetAttribute("USERID"));
                }

                if (!offspring) {
                    warn("❌ Failed to clone offspring template");
                    continue;
                }

                const offspringModel = offspring.FindFirstChild("Model") as Model;
                if (!offspringModel) {
                    warn(`❌ No Model found in offspring "${offspring.Name}"`);
                    offspring.Destroy();
                    continue;
                }

                if (!offspringModel.PrimaryPart) {
                    const parts = offspringModel.GetChildren().filter((child) => child.IsA("BasePart")) as BasePart[];
                    if (parts.size() > 0) {
                        offspringModel.PrimaryPart = parts[0];
                        print(`🛠️ Assigned ${parts[0].Name} as PrimaryPart for offspring model "${offspringModel.Name}"`);
                    } else {
                        warn(`❌ No BaseParts found in offspring model "${offspringModel.Name}" to assign as PrimaryPart`);
                        offspring.Destroy();
                        continue;
                    }
                }

                const offspringProperties = Rare.PickRandom(offspring.Name);
                if (!offspringProperties) {
                    warn("⚠️ Failed to get offspring properties");
                    offspring.Destroy();
                    continue;
                }

                for (const part of offspringModel.GetDescendants()) {
                    if (part.IsA("BasePart")) {
                        (part as BasePart).Anchored = true;
                        (part as BasePart).CanCollide = false;
                    }
                }

                const offspringPosition = ranPos.IsA("BasePart") ? ranPos.CFrame.Position : modelPosition;
                const offspringAdjustedPosition = offspringPosition.add(new Vector3(0, offsetY * offspringProperties.Scale * 0.5, 0));
                offspringModel.PivotTo(new CFrame(offspringAdjustedPosition));
                offspring.Parent = ranPos;
                print(`📍 Offspring positioned at: ${offspringModel.PrimaryPart.CFrame.Position}`);

                offspring.SetAttribute("SellingPrice", defaultValue * offspringProperties.Scale);

                if (offspringProperties.Modifier === "Gold") {
                    TurnGold(offspring);
                } else if (offspringProperties.Modifier === "Rainbow") {
                    TurnRainbow(offspring);
                }

                print(`📈 Scaling offspring ${offspring.Name}`);
                const scalePosition = ranPos.IsA("BasePart") ? ranPos.CFrame.Position : modelPosition;
                ScaleModel(offspringModel, offspringProperties.Scale * 0.5, growthTime * 0.5, scalePosition, offsetY);
                task.wait(growthTime * 0.5 + 0.5);

                const part = offspringModel.PrimaryPart;
                if (part) {
                    AddPrompt(animalTool, part.Size.X * 5, offspring);
                    print("🎁 Added pickup prompt to offspring");
                }

                const totalAnimals = GetAnimalNum(spawnPositionsFolder.GetChildren());
                if (totalAnimals >= 2) {
                    print("📦 Pen is full now");
                    animalTool.SetAttribute("IsFull", true);
                }
            }
        } else {
            print("🧍 Not a breeding animal, adding prompt only");
            const modelPart = model.PrimaryPart;
            if (modelPart) {
                AddPrompt(animalTool, modelPart.Size.X * 5);
                print("🎁 Added pickup prompt to main animal");
            }
        }
    });
};
export = AnimalModule;