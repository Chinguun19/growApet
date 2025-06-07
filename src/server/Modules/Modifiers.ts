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
		{ Name: "Lightning", Colour: Color3.fromRGB(0, 0, 0), Chance: "Very Rare" },
		{ Name: "Dark", Colour: Color3.fromRGB(0, 0, 0), Chance: "Very Rare" },
		{ Name: "Gold", Colour: Color3.fromRGB(240, 210, 41), Chance: "Rare" },
		{ Name: "Normal", Chance: "Common" },
	];

	export const Chance: ChanceEntry[] = [
		{ Name: "Very Rare", Chance: 10 },
		{ Name: "Rare", Chance: 10 },
		{ Name: "Common", Chance: 980 },
	];
	

export function PickRandom(): string {
	const roll = random(1, 1000);
	let cumulative = 0;

	for (const rarity of Chance) {
		cumulative += rarity.Chance;
		if (roll <= cumulative) {
			const matches = Scale.filter((mod) => mod.Chance === rarity.Name);
			const size = matches.size();

			if (size > 0) {
				const index = random(1, size);
				const picked = matches[index - 1]; // ✅ Lua arrays are 0-based in TypeScript arrays
				if (picked) {
					return picked.Name;
				}
			}
		}
	}

	return "Normal"; // fallback
}
}