import { Players } from "@rbxts/services";
import React from "@rbxts/react";
import UIReloader from "./UIReloader";
import { CashDisplay } from "./moneyUi";

const player = Players.LocalPlayer;
const gui = new Instance("ScreenGui");
gui.IgnoreGuiInset = true;
gui.ResetOnSpawn = false;
gui.Name = "MainUI";
gui.Parent = player.WaitForChild("PlayerGui");

UIReloader(gui, () => <CashDisplay />);
