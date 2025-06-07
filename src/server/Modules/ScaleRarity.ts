import { Rarity } from "./Modifiers";

export namespace Rare {
	const random = math.random;

	// Rarity multipliers for animals: how rarity affects value or stats
	export const RarityMultiplier: Record<string, Record<string, number>> = {
		Lion: {
			["Ultra Rare"]: 3,
			["Very Rare"]: 2,
			["Rare"]: 1.5,
			["Uncommon"]: 1.2,
			["Common"]: 1,
		},
		Wolf: {
			["Very Rare"]: 2,
			["Rare"]: 1.5,
			["Uncommon"]: 1.2,
			["Common"]: 1,
		},
		Chicken: {
			["Ultra Rare"]: 3,
			["Very Rare"]: 2,
			["Rare"]: 1.5,
			["Uncommon"]: 1.2,
			["Common"]: 1,
		},
		// Add other animals here
	};

	export const Chance: { Name: string; Chance: number }[] = [
		{ Name: "Ultra Rare", Chance: 5 },
		{ Name: "Very Rare", Chance: 15 },
		{ Name: "Rare", Chance: 100 },
		{ Name: "Uncommon", Chance: 300 },
		{ Name: "Common", Chance: 580 },
	];

	export function PickRandom(animalName: string): { Multiplier: number; Modifier: string | undefined } | undefined {
		const randomNum = random(1, 1000);
		let counter = 0;

		for (const chanceTable of Chance) {
			counter += chanceTable.Chance;

			if (randomNum <= counter) {
				const chosenMultiplier = RarityMultiplier[animalName]?.[chanceTable.Name];
				const randomModifier = Rarity.PickRandom();

				if (chosenMultiplier !== undefined) {
					return {
						Multiplier: chosenMultiplier,
						Modifier: randomModifier,
					};
				}
			}
		}

		return undefined;
	}
}
