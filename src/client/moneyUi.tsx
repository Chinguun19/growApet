import React, { useEffect, useState } from "@rbxts/react";
import { Players } from "@rbxts/services";

const player = Players.LocalPlayer;
const leaderstats = player.WaitForChild("leaderstats") as Folder;
const cashValue = leaderstats.WaitForChild("Cash") as NumberValue;

export function CashDisplay() {
	const [cash, setCash] = useState(cashValue.Value);

	useEffect(() => {
		const connection = cashValue.Changed.Connect(() => {
			setCash(cashValue.Value);
		});
		return () => connection.Disconnect();
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0, 1)}
			Position={new UDim2(0.02, 0, 1, -30)}
			Size={new UDim2(0, 280, 0, 60)} // Much larger
			BackgroundTransparency={1}
		>
			<imagelabel
				Image="rbxassetid://123441998554194"
				Size={new UDim2(0, 52, 0, 52)} // Bigger icon
				BackgroundTransparency={1}
				ScaleType="Fit"
			/>
			<textlabel
				Text={`$${cash}`}
				Size={new UDim2(1, -60, 1, 0)} // Wider text space
				Position={new UDim2(0, 60, 0, 0)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				TextXAlignment="Left"
				TextScaled={true}
				TextStrokeColor3={Color3.fromRGB(10, 10, 10)}
				TextStrokeTransparency={0.5}
				Font={Enum.Font.GothamBlack} // Bolder font
			/>
		</frame>
	);
}
