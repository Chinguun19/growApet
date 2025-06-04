// StarterPlayerScripts/EggEffects.ts
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { SoundService } from "@rbxts/services";

const player = Players.LocalPlayer;
const EggOpened = ReplicatedStorage.WaitForChild("EggOpened") as RemoteEvent;

function playEggEffects(reward: string, rarity: "Common" | "Rare" | "Epic" | "Legendary") {
    // 1. Drumroll sound
    const drumroll = new Instance("Sound");
    drumroll.SoundId = "rbxassetid://10972980427";
    drumroll.Parent = Workspace;
    drumroll.Play();

    // 2. Show opening UI (assuming GUI exists)
    const eggGui = player.WaitForChild("PlayerGui").WaitForChild("EggGUI") as ScreenGui;
    const openingText = eggGui.WaitForChild("OpeningText") as TextLabel;
    openingText.Visible = true;

    // 3. Delay for suspense
    wait(3);

    // 4. Rarity-based explosion
    const explosion = new Instance("ParticleEmitter");
    explosion.Texture = "rbxassetid://9756362";
    explosion.Color = new ColorSequence(
        rarity === "Legendary" 
            ? Color3.fromRGB(255, 215, 0) // Gold
            : Color3.fromRGB(100, 200, 255) // Blue
    );
    explosion.Parent = Workspace.CurrentCamera;
    explosion.Emit(50);

    // 5. Show reward
    const rewardText = eggGui.WaitForChild("RewardText") as TextLabel;
    rewardText.Text = `You got a ${reward}!`;
    rewardText.Visible = true;

    // 6. Cleanup
    drumroll.Destroy();
    delay(5, () => explosion.Destroy());
}

EggOpened.OnClientEvent.Connect(playEggEffects);