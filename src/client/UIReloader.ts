import React from "@rbxts/react";
import ReactRoblox, { Root } from "@rbxts/react-roblox";

let root: Root | undefined;

export default function UIReloader(parent: Instance, render: () => React.Element) {
	if (root) root.unmount(); // Hot reload: clear old
	root = ReactRoblox.createRoot(parent);
	root.render(render());
}
