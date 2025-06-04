// import React, { useState, useEffect, useRef, useCallback } from "@rbxts/react";

// interface InventoryItem {
// 	name: string;
// 	tool: Tool | undefined;
// 	icon: string;
// 	quantity: number;
// }

// interface HotbarSlotProps {
// 	slotIndex: number;
// 	item: InventoryItem;
// 	isSelected: boolean;
// 	onSelect: (index: number) => void;
// 	onEquip: (tool: Tool | undefined) => void;
// }

// function HotbarSlot({ slotIndex, item, isSelected, onSelect, onEquip }: HotbarSlotProps) {
// 	const isEmpty = item.name === "";

// 	const handleClick = useCallback(() => {
// 		onSelect(slotIndex);
// 		if (item.tool) {
// 			onEquip(item.tool);
// 		}
// 	}, [slotIndex, item.tool, onSelect, onEquip]);

// 	return (
// 		<frame
// 			Size={new UDim2(0, 60, 0, 60)}
// 			BackgroundColor3={isSelected ? Color3.fromRGB(100, 150, 255) : Color3.fromRGB(70, 70, 70)}
// 			BorderColor3={Color3.fromRGB(40, 40, 40)}
// 			BorderSizePixel={2}
// 			LayoutOrder={slotIndex}
// 		>
// 			{/* Item Icon */}
// 			{!isEmpty && (
// 				<imagelabel
// 					Size={new UDim2(0.8, 0, 0.8, 0)}
// 					Position={new UDim2(0.1, 0, 0.1, 0)}
// 					Image={item.icon}
// 					BackgroundTransparency={1}
// 					ScaleType={Enum.ScaleType.Fit}
// 				/>
// 			)}

// 			{/* Quantity Label (for stackable items) */}
// 			{!isEmpty && item.quantity > 1 && (
// 				<textlabel
// 					Size={new UDim2(0.4, 0, 0.3, 0)}
// 					Position={new UDim2(0.6, 0, 0.7, 0)}
// 					Text={tostring(item.quantity)}
// 					TextColor3={Color3.fromRGB(255, 255, 255)}
// 					TextScaled={true}
// 					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
// 					BackgroundTransparency={0.3}
// 					BorderSizePixel={0}
// 					Font={Enum.Font.SourceSansBold}
// 				/>
// 			)}

// 			{/* Hotkey Number */}
// 			<textlabel
// 				Size={new UDim2(0.3, 0, 0.25, 0)}
// 				Position={new UDim2(0, 2, 0, 2)}
// 				Text={tostring(slotIndex)}
// 				TextColor3={Color3.fromRGB(200, 200, 200)}
// 				TextScaled={true}
// 				BackgroundTransparency={1}
// 				Font={Enum.Font.SourceSans}
// 				TextStrokeTransparency={0.5}
// 				TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
// 			/>

// 			{/* Click Detection */}
// 			<textbutton
// 				Size={new UDim2(1, 0, 1, 0)}
// 				BackgroundTransparency={1}
// 				Text=""
// 				Event={{
// 					Activated: handleClick,
// 				}}
// 			/>

// 			{/* Selection Highlight */}
// 			{isSelected && (
// 				<frame
// 					Size={new UDim2(1, 4, 1, 4)}
// 					Position={new UDim2(0, -2, 0, -2)}
// 					BackgroundTransparency={1}
// 					BorderColor3={Color3.fromRGB(255, 255, 100)}
// 					BorderSizePixel={2}
// 					ZIndex={2}
// 				/>
// 			)}

// 			{/* Equipped indicator */}
// 			{item.tool && item.tool.Parent === game.GetService("Players").LocalPlayer.Character && (
// 				<frame
// 					Size={new UDim2(0.2, 0, 0.2, 0)}
// 					Position={new UDim2(0.8, 0, 0, 0)}
// 					BackgroundColor3={Color3.fromRGB(0, 255, 0)}
// 					BorderSizePixel={0}
// 				>
// 					<uicorner CornerRadius={new UDim(1, 0)} />
// 				</frame>
// 			)}
// 		</frame>
// 	);
// }

// export function HotbarInventory() {
// 	const [selectedSlot, setSelectedSlot] = useState(1);
// 	const [inventory, setInventory] = useState<InventoryItem[]>([]);
// 	const [equippedTool, setEquippedTool] = useState<Tool | undefined>(undefined);
// 	const connectionsRef = useRef<RBXScriptConnection[]>([]);
// 	const updateTimeoutRef = useRef<number | undefined>(undefined);

// 	// Disable default backpack UI
// 	useEffect(() => {
// 		const StarterGui = game.GetService("StarterGui");
// 		StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

// 		return () => {
// 			StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, true);
// 		};
// 	}, []);

// 	// Optimized inventory loading with caching
// 	const loadInventory = useCallback(() => {
// 		// Cancel previous timeout
// 		if (updateTimeoutRef.current) {
// 			clearTimeout(updateTimeoutRef.current);
// 		}

// 		// Debounce updates
// 		updateTimeoutRef.current = setTimeout(() => {
// 			const player = game.GetService("Players").LocalPlayer;
// 			const backpack = player.FindFirstChild("Backpack") as Backpack | undefined;
// 			const character = player.Character;

// 			if (!backpack) return;

// 			const tools: Tool[] = [];
			
// 			// Get tools from backpack (more efficient iteration)
// 			for (const child of backpack.GetChildren()) {
// 				if (child.IsA("Tool")) {
// 					tools.push(child);
// 				}
// 			}

// 			// Get equipped tool from character
// 			if (character) {
// 				for (const child of character.GetChildren()) {
// 					if (child.IsA("Tool")) {
// 						tools.push(child);
// 						setEquippedTool(child);
// 					}
// 				}
// 			}

// 			// Convert tools to inventory items (first 9 tools for hotbar)
// 			const newInventory: InventoryItem[] = [];
// 			for (let i = 0; i < 9; i++) {
// 				if (i < tools.size()) {
// 					const tool = tools[i];
// 					let icon = "rbxasset://textures/ui/GuiImagePlaceholder.png";
					
// 					// Simplified icon detection (faster)
// 					const textureId = tool.FindFirstChild("TextureId") as StringValue | undefined;
// 					if (textureId && textureId.Value !== "") {
// 						icon = textureId.Value;
// 					} else {
// 						const handle = tool.FindFirstChild("Handle") as BasePart | undefined;
// 						if (handle) {
// 							const mesh = handle.FindFirstChildOfClass("SpecialMesh");
// 							if (mesh && mesh.TextureId !== "") {
// 								icon = mesh.TextureId;
// 							}
// 						}
// 					}

// 					newInventory.push({
// 						name: tool.Name,
// 						tool: tool,
// 						icon: icon,
// 						quantity: 1,
// 					});
// 				} else {
// 					newInventory.push({
// 						name: "",
// 						tool: undefined,
// 						icon: "",
// 						quantity: 0,
// 					});
// 				}
// 			}

// 			setInventory(newInventory);
// 		}, 50); // 50ms debounce
// 	}, []);

// 	// Handle tool equipping (optimized)
// 	const handleEquipTool = useCallback((tool: Tool | undefined) => {
// 		const player = game.GetService("Players").LocalPlayer;
// 		const character = player.Character;
// 		const humanoid = character?.FindFirstChild("Humanoid") as Humanoid | undefined;

// 		if (!humanoid) return;

// 		// Quick unequip/equip
// 		if (equippedTool && equippedTool !== tool) {
// 			humanoid.UnequipTools();
// 		}

// 		if (tool && tool.Parent === player.FindFirstChild("Backpack")) {
// 			humanoid.EquipTool(tool);
// 		}
// 	}, [equippedTool]);

// 	// Simplified connection management
// 	useEffect(() => {
// 		const player = game.GetService("Players").LocalPlayer;
// 		const backpack = player.FindFirstChild("Backpack") as Backpack | undefined;
		
// 		if (!backpack) return;

// 		// Clear existing connections
// 		connectionsRef.current.forEach(conn => conn.Disconnect());
// 		connectionsRef.current = [];

// 		// Initial load
// 		loadInventory();

// 		// Single backpack listener
// 		const backpackConnection = backpack.ChildAdded.Connect(() => loadInventory());
// 		const backpackRemovedConnection = backpack.ChildRemoved.Connect(() => loadInventory());
		
// 		connectionsRef.current.push(backpackConnection, backpackRemovedConnection);

// 		// Character listener
// 		const characterConnection = player.CharacterAdded.Connect(() => {
// 			// Small delay for character to load
// 			setTimeout(() => loadInventory(), 100);
// 		});
		
// 		connectionsRef.current.push(characterConnection);

// 		return () => {
// 			connectionsRef.current.forEach(conn => conn.Disconnect());
// 			connectionsRef.current = [];
// 			if (updateTimeoutRef.current) {
// 				clearTimeout(updateTimeoutRef.current);
// 			}
// 		};
// 	}, [loadInventory]);

// 	// Optimized hotkey input
// 	useEffect(() => {
// 		const UserInputService = game.GetService("UserInputService");

// 		const keyMap = new Map<Enum.KeyCode, number>([
// 			[Enum.KeyCode.One as Enum.KeyCode, 1],
// 			[Enum.KeyCode.Two as Enum.KeyCode, 2],
// 			[Enum.KeyCode.Three as Enum.KeyCode, 3],
// 			[Enum.KeyCode.Four as Enum.KeyCode, 4],
// 			[Enum.KeyCode.Five as Enum.KeyCode, 5],
// 			[Enum.KeyCode.Six as Enum.KeyCode, 6],
// 			[Enum.KeyCode.Seven as Enum.KeyCode, 7],
// 			[Enum.KeyCode.Eight as Enum.KeyCode, 8],
// 			[Enum.KeyCode.Nine as Enum.KeyCode, 9],
// 		]);

// 		const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
// 			if (gameProcessed) return;

// 			const slotNumber = keyMap.get(input.KeyCode);
// 			if (slotNumber !== undefined) {
// 				setSelectedSlot(slotNumber);
// 				const selectedItem = inventory[slotNumber - 1];
// 				if (selectedItem?.tool) {
// 					handleEquipTool(selectedItem.tool);
// 				}
// 			}
// 		});

// 		return () => connection.Disconnect();
// 	}, [inventory, handleEquipTool]);

// 	const selectedItem = inventory[selectedSlot - 1] || { name: "", tool: undefined, icon: "", quantity: 0 };

// 	return (
// 		<screengui ResetOnSpawn={false}>
// 			<frame
// 				Size={new UDim2(0, 580, 0, 80)}
// 				Position={new UDim2(0.5, -290, 1, -100)}
// 				BackgroundColor3={Color3.fromRGB(40, 40, 40)}
// 				BackgroundTransparency={0.2}
// 				BorderSizePixel={0}
// 			>
// 				{/* Background decoration */}
// 				<frame
// 					Size={new UDim2(1, 0, 1, 0)}
// 					BackgroundColor3={Color3.fromRGB(20, 20, 20)}
// 					BackgroundTransparency={0.5}
// 					BorderSizePixel={0}
// 				/>

// 				{/* Slot container */}
// 				<frame
// 					Size={new UDim2(1, -20, 1, -20)}
// 					Position={new UDim2(0, 10, 0, 10)}
// 					BackgroundTransparency={1}
// 				>
// 					<uilistlayout
// 						FillDirection={Enum.FillDirection.Horizontal}
// 						HorizontalAlignment={Enum.HorizontalAlignment.Center}
// 						VerticalAlignment={Enum.VerticalAlignment.Center}
// 						Padding={new UDim(0, 5)}
// 						SortOrder={Enum.SortOrder.LayoutOrder}
// 					/>

// 					{/* Render all slots */}
// 					{inventory.map((item, index) => (
// 						<HotbarSlot
// 							key={index}
// 							slotIndex={index + 1}
// 							item={item}
// 							isSelected={selectedSlot === index + 1}
// 							onSelect={setSelectedSlot}
// 							onEquip={handleEquipTool}
// 						/>
// 					))}
// 				</frame>

// 				{/* Selected item name display */}
// 				<textlabel
// 					Size={new UDim2(0, 200, 0, 25)}
// 					Position={new UDim2(0.5, -100, 0, -30)}
// 					Text={selectedItem.name !== "" ? selectedItem.name : "Empty"}
// 					TextColor3={Color3.fromRGB(255, 255, 255)}
// 					TextScaled={true}
// 					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
// 					BackgroundTransparency={0.3}
// 					BorderSizePixel={0}
// 					Font={Enum.Font.SourceSans}
// 					TextStrokeTransparency={0.5}
// 					TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
// 				/>
// 			</frame>
// 		</screengui>
// 	);
// }

// function clearTimeout(current: number | undefined) {
// 	if (typeIs(current, "number")) {
	
// 		(clearTimeout as unknown as (id: number) => void)(current);
// 	}
// }
// // Roblox-ts polyfill for setTimeout using task.delay
// function setTimeout(callback: () => void, delay: number): number {
// 	const seconds = delay / 1000;
// 	const thread = task.delay(seconds, callback);

// 	return thread as unknown as number;
// }

