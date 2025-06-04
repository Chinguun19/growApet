// Rarity.ts
import { Rarity } from "./Modifiers";

export namespace Rare {
	const random = math.random;

	export const Scale: Record<string, Record<string, number>> = {
		Carrot: {
			["Very Rare"]: 5,
			["Rare"]: 4,
			["Uncommon"]: random(2, 3),
			["Common"]: 1,
		},
		Blueberry: {
			["Very Rare"]: 4,
			["Rare"]: 3,
			["Uncommon"]: 2,
			["Common"]: 1,
		},
		Watermelon: {
			["Ultra Rare"]: 25,
			["Very Rare"]: 7,
			["Rare"]: 5,
			["Uncommon"]: 3,
			["Common"]: random(1, 2),
		},
		Bamboo: {
			["Ultra Rare"]: 25,
			["Very Rare"]: 7,
			["Rare"]: 5,
			["Uncommon"]: 3,
			["Common"]: random(1, 2),
		},
		Eggplant: {
			["Ultra Rare"]: 100,
			["Very Rare"]: 3,
			["Rare"]: 2,
			["Uncommon"]: 1,
			["Common"]: 1,
		},
	};

	export const Chance: { Name: string; Chance: number }[] = [
		{ Name: "Ultra Rare", Chance: 1 },
		{ Name: "Very Rare", Chance: 10 },
		{ Name: "Rare", Chance: 100 },
		{ Name: "Uncommon", Chance: 300 },
		{ Name: "Common", Chance: 589 },
	];

	export function PickRandom(cropName: string): { Scale: number; Modifier: unknown } | undefined {
		const randomNum = random(1, 1000);
		let counter = 0;

		for (const chanceTable of Chance) {
			counter += chanceTable.Chance;

			if (randomNum <= counter) {
				const chosenScale = Scale[cropName]?.[chanceTable.Name];
				const randomModifier = Rarity.PickRandom();

				if (chosenScale !== undefined) {
					return {
						Scale: chosenScale,
						Modifier: randomModifier,
					};
				}
			}
		}

		return undefined;
	}
}
