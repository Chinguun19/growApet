import { ReplicatedStorage, Players } from "@rbxts/services";
import { UserInputService } from "@rbxts/services";

const player = Players.LocalPlayer;
const event = ReplicatedStorage.WaitForChild("CollectionUpdateEvent") as RemoteEvent;

const collectionFrame = script.Parent!.WaitForChild("ScrollingFrame") as ScrollingFrame;

const ownedAnimals = new Set<string>();

function addAnimalEntry(animalName: string) {
  if (ownedAnimals.has(animalName)) return; // Already added

  ownedAnimals.add(animalName);

  const template = collectionFrame.WaitForChild("AnimalTemplate") as Frame;
  const newEntry = template.Clone();
  newEntry.Name = animalName;
  newEntry.Visible = true;
  newEntry.Parent = collectionFrame;

  const label = newEntry.WaitForChild("AnimalNameLabel") as TextLabel;
  label.Text = animalName;

  // Optionally set animal image/icon here  
  // const image = newEntry.WaitForChild("AnimalImage") as ImageLabel;
  // image.Image = getAnimalImage(animalName);
}

event.OnClientEvent.Connect((animalName: string) => {
  addAnimalEntry(animalName);
});

// Example to toggle book UI with a keypress
UserInputService.InputBegan.Connect(input => {
  if (input.KeyCode === Enum.KeyCode.B) {
    (script.Parent as ScreenGui).Enabled = !(script.Parent as ScreenGui).Enabled;
  }
});
