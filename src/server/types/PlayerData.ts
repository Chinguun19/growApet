// For serializing Roblox Vector3
export interface Vector3Data {
	x: number;
	y: number;
	z: number;
}

// Represents an item in the player's inventory
export interface InventoryItemData {
	name: string;
	sellingPrice?: number;
	scale?: number;
	modifier?: string;
	isHarvester?: boolean;
}

// Represents an animal currently growing on the plot
export interface AnimalProperties {
	animalName: string;
	position: Vector3Data;
	targetScale: number;
	modifier: string;
	growthStartTime: number; // Unix timestamp
	growthDuration: number; // Duration in seconds
}


// The main saved structure for each player
export interface PlayerData {
    userId: number;
	cash: number;
	inventory: InventoryItemData[];
	AnimalProperties: AnimalProperties[];
	lastLogoutTime?: number;
}


