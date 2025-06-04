import React, { useEffect, useState } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";

// Constants
const GROWTH_ATTRIBUTE = "GrowthPercentage";
const UPDATE_INTERVAL = 0.1; // seconds

// This is a proper React component for Roblox-TS
export function AnimalGrowthUI(): JSX.Element {
    const [visible, setVisible] = useState(false);
    const [animalName, setAnimalName] = useState("Animal");
    const [growthPercent, setGrowthPercent] = useState(0);
    
    useEffect(() => {
        const player = Players.LocalPlayer;
        let lastUpdateTime = 0;
        let currentTarget: Model | undefined;
        
        // Function to check if an instance is an animal
        const isAnimal = (instance: Instance): boolean => {
            if (instance.IsA("Model")) {
                return instance.GetAttribute(GROWTH_ATTRIBUTE) !== undefined;
            }
            return false;
        };
        
        // Function to find animal from a part
        const findAnimalFromPart = (part: BasePart): Model | undefined => {
            let current: Instance | undefined = part;
            while (current && !isAnimal(current)) {
                current = current.Parent;
            }
            return current?.IsA("Model") ? current : undefined;
        };
        
        // Function to update the UI with animal growth data
        const updateGrowthUI = (animal: Model | undefined) => {
            if (!animal) {
                setVisible(false);
                currentTarget = undefined;
                return;
            }
            
            // If it's the same animal as before, no need to update
            if (currentTarget === animal) return;
            
            currentTarget = animal;
            
            const growthPercentage = animal.GetAttribute(GROWTH_ATTRIBUTE) as number;
            if (growthPercentage === undefined) {
                setVisible(false);
                return;
            }
            
            // Update UI elements
            setAnimalName(animal.Name);
            setGrowthPercent(math.floor(growthPercentage));
            setVisible(true);
        };
        
        // Check for targeted animals on mouse
        const connection = RunService.Heartbeat.Connect((deltaTime) => {
            const now = tick();
            if (now - lastUpdateTime < UPDATE_INTERVAL) return;
            lastUpdateTime = now;
            
            // Check for mouse target
            const mouse = player.GetMouse();
            const target = mouse.Target;
            
            if (target && target.IsA("BasePart")) {
                const animal = findAnimalFromPart(target);
                updateGrowthUI(animal);
            } else if (currentTarget) {
                setVisible(false);
                currentTarget = undefined;
            }
        });
        
        // For mobile: Check for touched animals
        let character: Model;
        if (player.Character) {
            character = player.Character;
        } else {
            const [char] = player.CharacterAdded.Wait();
            character = char;
        }
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        
        // Set up touch detection for mobile
        const touchConnection = humanoid.Touched.Connect((part) => {
            const animal = findAnimalFromPart(part);
            if (animal) {
                updateGrowthUI(animal);
                
                // Hide UI after 3 seconds (for touch interactions)
                task.delay(3, () => {
                    if (currentTarget === animal) {
                        setVisible(false);
                        currentTarget = undefined;
                    }
                });
            }
        });
        
        // Cleanup
        return () => {
            connection.Disconnect();
            touchConnection.Disconnect();
        };
    }, []);
    
    if (!visible) return <></>;
    
    return (
        <frame
            Size={UDim2.fromOffset(200, 50)}
            Position={UDim2.fromScale(0.5, 0.8)}
            AnchorPoint={new Vector2(0.5, 0)}
            BackgroundColor3={Color3.fromRGB(40, 40, 40)}
            BackgroundTransparency={0.3}
            BorderSizePixel={0}
        >
            {/* Corner rounding */}
            <uicorner CornerRadius={new UDim(0, 8)} />
            
            {/* Add stroke for better visibility */}
            <uistroke
                Color={Color3.fromRGB(255, 255, 255)}
                Thickness={2}
                Transparency={0.5}
            />
            
            {/* Animal name label */}
            <textlabel
                Text={animalName}
                Size={UDim2.fromScale(1, 0.5)}
                Position={UDim2.fromScale(0, 0)}
                BackgroundTransparency={1}
                Font={Enum.Font.GothamBold}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={18}
            />
            
            {/* Progress bar background */}
            <frame
                Size={UDim2.fromScale(0.9, 0.3)}
                Position={UDim2.fromScale(0.05, 0.6)}
                BackgroundColor3={Color3.fromRGB(80, 80, 80)}
                BorderSizePixel={0}
            >
                {/* Corner rounding */}
                <uicorner CornerRadius={new UDim(1, 0)} />
                
                {/* Progress bar fill */}
                <frame
                    Size={UDim2.fromScale(math.clamp(growthPercent / 100, 0, 1), 1)}
                    BackgroundColor3={Color3.fromRGB(76, 209, 55)}
                    BorderSizePixel={0}
                >
                    {/* Corner rounding */}
                    <uicorner CornerRadius={new UDim(1, 0)} />
                    
                    {/* Gradient */}
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(76, 209, 55)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(156, 255, 143))
                        ])}
                    />
                </frame>
            </frame>
            
            {/* Percentage text */}
            <textlabel
                Text={`${growthPercent}%`}
                Size={UDim2.fromScale(0.2, 0.3)}
                Position={UDim2.fromScale(0.95, 0.6)}
                AnchorPoint={new Vector2(1, 0)}
                BackgroundTransparency={1}
                Font={Enum.Font.GothamBold}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={16}
            />
        </frame>
    );
}
