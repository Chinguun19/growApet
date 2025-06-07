// import { Players, ReplicatedStorage } from "@rbxts/services";

// interface TradeRequest {
//   from: Player;
//   to: Player;
//   fromItems: Tool[];
//   toItems: Tool[];
//   acceptedByFrom: boolean;
//   acceptedByTo: boolean;
//   locked: boolean;
// }

// const TradeRequests = new Map<Player, TradeRequest>();

// // RemoteEvents for communication
// const TradeRequestEvent = ReplicatedStorage.WaitForChild("TradeRequestEvent") as RemoteEvent;
// const TradeResponseEvent = ReplicatedStorage.WaitForChild("TradeResponseEvent") as RemoteEvent;

// function lockTools(tools: Tool[], lock: boolean) {
//   for (const tool of tools) {
//     tool.Enabled = !lock; // Disable tool usage during trade
//   }
// }

// function transferTools(fromPlayer: Player, toPlayer: Player, tools: Tool[]) {
//   const toBackpack = toPlayer.WaitForChild("Backpack") as Folder;
//   for (const tool of tools) {
//     if (tool.Parent === fromPlayer.WaitForChild("Backpack")) {
//       tool.Parent = toBackpack;
//     }
//   }
// }

// function isTool(instance: Instance | undefined): instance is Tool {
//   return instance !== undefined && instance.IsA("Tool");
// }


// function cancelTrade(player: Player) {
//   const trade = TradeRequests.get(player);
//   if (!trade) return;

//   lockTools(trade.fromItems, false);
//   lockTools(trade.toItems, false);

//   TradeRequests.delete(trade.from);
//   TradeRequests.delete(trade.to);
// }

// TradeRequestEvent.OnServerEvent.Connect((player, ...args: unknown[]) => {
//   if (
//     args.length !== 3 ||
//     typeof args[0] !== "number" ||
//     !Array.isArray(args[1]) ||
//     !Array.isArray(args[2])
//   ) {
//     warn("Invalid arguments for trade request");
//     return;
//   }

//   const toUserId = args[0] as number;
//   const fromToolIds = args[1] as string[];
//   const toToolIds = args[2] as string[];

//   const toPlayer = Players.GetPlayers().find(p => p.UserId === toUserId);
//   if (!toPlayer) return;

//   if (TradeRequests.has(player) || TradeRequests.has(toPlayer)) {
//     // One of them is already trading
//     return;
//   }

//   const playerBackpack = player.WaitForChild("Backpack") as Folder;
//   const toPlayerBackpack = toPlayer.WaitForChild("Backpack") as Folder;

// const fromTools = fromToolIds
//   .map(id => playerBackpack.FindFirstChild(id))
//   .filter(isTool);

// const toTools = toToolIds
//   .map(id => toPlayerBackpack.FindFirstChild(id))
//   .filter(isTool);
  

//   // Lock tools
//   lockTools(fromTools, true);
//   lockTools(toTools, true);

//   const tradeRequest: TradeRequest = {
//     from: player,
//     to: toPlayer,
//     fromItems: fromTools,
//     toItems: toTools,
//     acceptedByFrom: false,
//     acceptedByTo: false,
//     locked: true,
//   };

//   TradeRequests.set(player, tradeRequest);
//   TradeRequests.set(toPlayer, tradeRequest);

//   // TODO: Notify toPlayer about the trade request here
// });

// TradeResponseEvent.OnServerEvent.Connect((player, ...args: unknown[]) => {
//   if (args.length !== 1 || typeof args[0] !== "boolean") {
//     warn("Invalid arguments for trade response");
//     return;
//   }

//   const accept = args[0] as boolean;
//   const trade = TradeRequests.get(player);
//   if (!trade) return;

//   if (player === trade.from) {
//     trade.acceptedByFrom = accept;
//   } else if (player === trade.to) {
//     trade.acceptedByTo = accept;
//   }

//   if (trade.acceptedByFrom && trade.acceptedByTo) {
//     // Complete trade
//     transferTools(trade.from, trade.to, trade.fromItems);
//     transferTools(trade.to, trade.from, trade.toItems);

//     lockTools(trade.fromItems, false);
//     lockTools(trade.toItems, false);

//     TradeRequests.delete(trade.from);
//     TradeRequests.delete(trade.to);
//   }

//   if (!accept) {
//     cancelTrade(player);
//   }
// });

// Players.PlayerRemoving.Connect(player => {
//   const trade = TradeRequests.get(player);
//   if (!trade) return;

//   cancelTrade(player);
// });
