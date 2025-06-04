import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { MoneyUI } from "./moneyUi";
import { AnimalGrowthUI } from "./AnimalGrowthUI";

// Wait for the LocalPlayer's PlayerGui
const Players = game.GetService("Players");
const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

// Create a ScreenGui to hold our UI
const screenGui = new Instance("ScreenGui");
screenGui.Name = "ReactCounterGui";
screenGui.ResetOnSpawn = false;
screenGui.Parent = playerGui;

// Main App component to combine all UI elements
function App() {
    return (
        <>
            <MoneyUI />
            <AnimalGrowthUI />
        </>
    );
}

// Mount the React component
const root = createRoot(screenGui);
root.render(createPortal(<App />, screenGui));
