// ServerScriptService/EggOpener.ts
import { Players, ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { EggData } from "shared/EggData";

interface EggDrop {
    Animal: string;
    Chance: number;
}

const OpenEggEvent = ReplicatedStorage.WaitForChild("OpenEgg") as RemoteEvent;
const EggOpenedEvent = ReplicatedStorage.WaitForChild("EggOpened") as RemoteEvent;

function openEgg(player: Player, eggName: string) {
    const egg = EggData[eggName];
    if (!egg) return;

    // 1. Remove egg from inventory (implement your own inventory system)
    // player.Inventory.RemoveEgg(eggName);

    // 2. Calculate weighted reward
    const totalWeight = egg.Drops.reduce((sum: number, drop: EggDrop) => sum + drop.Chance, 0);
    const roll = math.random(1, totalWeight);
    
    let cumulativeWeight = 0;
    let reward: string | undefined;

    for (const drop of egg.Drops) {
        cumulativeWeight += drop.Chance;
        if (roll <= cumulativeWeight) {
            reward = drop.Animal;
            break;
        }
    }

    if (!reward) return;

    // 3. Give reward and notify player
    // player.Inventory.AddAnimal(reward);
    EggOpenedEvent.FireClient(player, reward, egg.Rarity);
}

OpenEggEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const eggName = args[0];
    if (typeOf(eggName) !== "string") return;
    openEgg(player, eggName as string);
});