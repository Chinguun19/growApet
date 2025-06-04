import React, { useEffect, useState } from "@rbxts/react";
import { Players, RunService, ReplicatedStorage } from "@rbxts/services";

// Button component for the left side buttons
interface GameButtonProps {
	text: string;
	color: Color3;
	position: UDim2;
	iconId: string;
	onClick?: () => void;
}

function GameButton({ text, color, position, iconId, onClick }: GameButtonProps) {
	return (
		<textbutton
			Text=""
			Size={UDim2.fromOffset(120, 50)}
			Position={position}
			BackgroundColor3={color}
			BorderSizePixel={0}
			AutoButtonColor={true}
			Event={{
				MouseButton1Click: onClick,
			}}
		>
			{/* Button shadow/border */}
			<frame
				Size={UDim2.fromScale(1, 1)}
				Position={UDim2.fromOffset(0, 4)}
				AnchorPoint={new Vector2(0, 0)}
				ZIndex={0}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0.2, 0)} />
			</frame>
			
			{/* Main button body */}
			<frame
				Size={UDim2.fromScale(1, 0.9)}
				Position={UDim2.fromScale(0, 0)}
				BackgroundColor3={color}
				BorderSizePixel={0}
				ZIndex={2}
			>
				<uicorner CornerRadius={new UDim(0.2, 0)} />
				
				{/* Icon */}
				<imagelabel
					Image={iconId}
					Size={UDim2.fromScale(0.25, 0.5)}
					Position={UDim2.fromScale(0.15, 0.5)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					ZIndex={3}
				/>
				
				{/* Button text */}
				<textlabel
					Text={text.upper()}
					Size={UDim2.fromScale(0.7, 1)}
					Position={UDim2.fromScale(0.65, 0.5)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Font={Enum.Font.GothamBold}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={24}
					TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
					TextStrokeTransparency={0.5}
					ZIndex={3}
				>
					{/* Text shadow for better readability */}
					<uistroke 
						Color={Color3.fromRGB(0, 0, 0)} 
						Thickness={2}
					/>
				</textlabel>
			</frame>
			
			<uicorner CornerRadius={new UDim(0.2, 0)} />
		</textbutton>
	);
}

export function MoneyUI() {
	const [cash, setCash] = useState(0);
	const [displayCash, setDisplayCash] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [bounceOffset, setBounceOffset] = useState(0);

	// Animate cash changes with smooth counting
	const animateCashChange = (newValue: number) => {
		if (isAnimating) return;
		
		setIsAnimating(true);
		const startValue = displayCash;
		const difference = newValue - startValue;
		const duration = math.min(1, math.abs(difference) / 1000); // Scale duration based on change
		
		const startTime = tick();
		const updateLoop = () => {
			const elapsed = tick() - startTime;
			const progress = math.min(elapsed / duration, 1);
			
			// Easing function for smooth animation
			const easedProgress = 1 - math.pow(1 - progress, 3);
			const currentValue = startValue + (difference * easedProgress);
			
			setDisplayCash(math.floor(currentValue));
			
			if (progress < 1) {
				RunService.Heartbeat.Wait();
				updateLoop();
			} else {
				setDisplayCash(newValue);
				setIsAnimating(false);
			}
		};
		
		updateLoop();
	};

	// Gentle bounce animation for the coin
	useEffect(() => {
		const connection = RunService.Heartbeat.Connect(() => {
			const time = tick();
			const newOffset = math.sin(time * 2) * 0.03;
			setBounceOffset(newOffset);
		});

		return () => connection.Disconnect();
	}, []);

	useEffect(() => {
		const player = Players.LocalPlayer;
		const leaderstats = player.WaitForChild("leaderstats") as Folder;
		const cashValue = leaderstats.WaitForChild("Cash") as IntValue;

		// Initial set
		const initialCash = cashValue.Value;
		setCash(initialCash);
		setDisplayCash(initialCash);

		// Connect change listener
		const connection = cashValue.Changed.Connect((newValue) => {
			setCash(newValue);
			animateCashChange(newValue);
		});

		// Cleanup
		return () => connection.Disconnect();
	}, []);

	// Format cash with commas (Luau-compatible)
	const formatCash = (amount: number): string => {
		const str = tostring(amount);
		let result = "";
		let count = 0;
		
		for (let i = str.size() - 1; i >= 0; i--) {
			if (count === 3) {
				result = "," + result;
				count = 0;
			}
			result = str.sub(i + 1, i + 1) + result;
			count++;
		}
		
		return result;
	};

	// Button click handlers
	const handleShopClick = () => {
		print("Shop button clicked!");
	};

	const handleVIPClick = () => {
		print("VIP button clicked!");
	};

	const handleInventoryClick = () => {
		print("Inventory button clicked!");
	};

	return (
		<>
			{/* Coins display in top-right corner */}
			<frame
				Size={UDim2.fromOffset(150, 40)}
				Position={UDim2.fromScale(0.98, 0.03)}
				AnchorPoint={new Vector2(1, 0)}
				BackgroundTransparency={1}
			>
				<frame
					Size={UDim2.fromScale(1, 1)}
					BackgroundColor3={Color3.fromRGB(30, 30, 30)}
					BackgroundTransparency={0.3}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, 8)} />
					
					<uistroke
						Color={Color3.fromRGB(255, 255, 255)}
						Thickness={1.5}
						Transparency={0.5}
					/>
					
					{/* Coin icon with bounce animation */}
					<frame
						Size={UDim2.fromScale(0.25, 0.8)}
						Position={UDim2.fromScale(0.08, 0.5 + bounceOffset)}
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundTransparency={1}
					>
						<imagelabel
							Size={UDim2.fromScale(1, 1)}
							BackgroundTransparency={1}
							Image="rbxassetid://75893614456042" // Updated coin asset ID
							ImageColor3={Color3.fromRGB(255, 215, 0)} // Gold color
						/>
					</frame>
					
					{/* Cash amount */}
					<textlabel
						Text={formatCash(displayCash)}
						Size={UDim2.fromScale(0.6, 0.5)}
						Position={UDim2.fromScale(0.38, 0.35)}
						BackgroundTransparency={1}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						Font={Enum.Font.GothamBold}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
					
					{/* "COINS" label */}
					<textlabel
						Text="COINS"
						Size={UDim2.fromScale(0.5, 0.25)}
						Position={UDim2.fromScale(0.38, 0.7)}
						BackgroundTransparency={1}
						TextColor3={Color3.fromRGB(255, 255, 200)}
						TextScaled={true}
						Font={Enum.Font.GothamBold}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>
			</frame>
			
			{/* Left side buttons */}
			<frame
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
			>
				{/* SHOP Button */}
				<GameButton
					text="SHOP"
					color={Color3.fromRGB(170, 85, 255)} // Purple
					position={UDim2.fromScale(0.05, 0.3)}
					iconId="rbxassetid://75893614456042" // Shop icon (using coin as placeholder)
					onClick={handleShopClick}
				/>
				
				{/* EGG Button */}
				<GameButton
					text="EGGS"
					color={Color3.fromRGB(255, 200, 0)} // Gold
					position={UDim2.fromScale(0.05, 0.2)}
					iconId="rbxassetid://136500849750777" // Egg icon
					onClick={handleVIPClick}
				/>
				
				{/* BOOK Button */}
				<GameButton
					text="GUIDE"
					color={Color3.fromRGB(80, 120, 200)} // Blue
					position={UDim2.fromScale(0.05, 0.4)}
					iconId="rbxassetid://136500849750777" // Book icon (using egg as placeholder)
					onClick={handleInventoryClick}
				/>
			</frame>
		</>
	);
}
