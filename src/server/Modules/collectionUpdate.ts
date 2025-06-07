import { Players } from "@rbxts/services";
import { ReplicatedStorage } from "@rbxts/services";

const playerCollections = new Map<Player, Set<string>>();

Players.PlayerAdded.Connect(player => {
  // Initialize collection
  playerCollections.set(player, new Set());

  // Example: Listen for when player gets an animal
  player.CharacterAdded.Connect(character => {
    // For example, when an animal tool is given to player
    // call addAnimalToCollection(player, animalName)
  });
});

function addAnimalToCollection(player: Player, animalName: string) {
  let collection = playerCollections.get(player);
  if (!collection) {
    collection = new Set();
    playerCollections.set(player, collection);
  }

  if (!collection.has(animalName)) {
    collection.add(animalName);
    // Optionally save to DataStore here
    // Notify player UI about new animal
    notifyCollectionUpdate(player, animalName);
  }
}

function notifyCollectionUpdate(player: Player, animalName: string) {
  // Fire client event to update collection UI
  // (Assuming you have a RemoteEvent in ReplicatedStorage)
  const event = ReplicatedStorage.WaitForChild("CollectionUpdateEvent") as RemoteEvent;
  event.FireClient(player, animalName);
}
