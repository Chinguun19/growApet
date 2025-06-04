// Rarity.ts

export namespace Rarity {
	const random = math.random;

	export interface Modifier {
		Name: string;
		Colour?: Color3;
		Chance: string;
	}

	export interface ChanceEntry {
		Name: string;
		Chance: number;
	}

	export const Scale: Modifier[] = [
		{ Name: "Rainbow", Colour: Color3.fromRGB(240, 210, 41), Chance: "Very Rare" },
		{ Name: "Gold", Colour: Color3.fromRGB(240, 210, 41), Chance: "Rare" },
		{ Name: "Normal", Chance: "Common" },
	];

	export const Chance: ChanceEntry[] = [
		{ Name: "Very Rare", Chance: 100 },
		{ Name: "Rare", Chance: 300 },
		{ Name: "Common", Chance: 600 },
	];

	export function PickRandom(): string | undefined {
		const randomNum = random(1, 1000);
		let counter = 0;

		for (let i = 0; i < Chance.size(); i++) {
			const chanceTable = Chance[i];
			counter += chanceTable.Chance;

			if (randomNum <= counter) {
				const chosenModifier = Scale[i];
				return chosenModifier?.Name;
			}
		}
	}
}
