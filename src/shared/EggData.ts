export interface Egg {
    Drops: {
        Animal: string;
        Chance: number;
    }[];
    Rarity: string;
}

export const EggData: { [key: string]: Egg } = {
    "Wooden Egg": {
        Drops: [
            { Animal: "Black Bear", Chance: 60 },
            { Animal: "Red Fox", Chance: 30 },
            { Animal: "Polar Bear", Chance: 10 }
        ],
        Rarity: "Common"
    },
    "Golden Egg": {
        Drops: [
            { Animal: "Golden Bear", Chance: 5 },
            { Animal: "Silver Fox", Chance: 35 },
            { Animal: "Sabertooth Tiger", Chance: 60 }
        ],
        Rarity: "Rare"
    },
    "Basic Egg": {
        Drops: [
            { Animal: "Cat", Chance: 70 },
            { Animal: "Dog", Chance: 30 }
        ],
        Rarity: "Common"
    }
};