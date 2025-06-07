import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

// Assuming you have a ScreenGui named "RewardPopupGui" in PlayerGui
const rewardGui = playerGui.WaitForChild("RewardPopupGui") as ScreenGui;
const popupFrame = rewardGui.WaitForChild("PopupFrame") as Frame;
const messageLabel = popupFrame.WaitForChild("Message") as TextLabel;
const animalImage = popupFrame.WaitForChild("AnimalImage") as ImageLabel;

// Load sound and particle effects from ReplicatedStorage
const rewardSound = ReplicatedStorage.WaitForChild("RewardSound") as Sound;
const sparkleEffect = ReplicatedStorage.WaitForChild("SparkleEffect") as ParticleEmitter;

function cloneAndPlaySound(parent: Instance) {
    const sound = rewardSound.Clone() as Sound;
    sound.Parent = parent;
    sound.PlaybackSpeed = 1;
    sound.Play();
    sound.Ended.Connect(() => sound.Destroy());
    return sound;
}

function showRewardPopup(animalName: string, imageAssetId: string) {
    messageLabel.Text = `Congratulations! You hatched a ${animalName}!`;
    animalImage.Image = imageAssetId;

    popupFrame.Visible = true;
    popupFrame.BackgroundTransparency = 1;
    popupFrame.Size = new UDim2(0, 0, 0, 0);

    // Play sound
    cloneAndPlaySound(popupFrame);

    // Enable sparkle particles
    sparkleEffect.Parent = popupFrame;
    sparkleEffect.Enabled = true;

    // Animate popup in
    const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
    TweenService.Create(popupFrame, tweenInfo, { Size: new UDim2(0, 300, 0, 150), BackgroundTransparency: 0.2 }).Play();

    // Auto-hide after 4 seconds
    task.delay(4, () => {
        const tweenOut = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In);
        const tween = TweenService.Create(popupFrame, tweenOut, { Size: new UDim2(0, 0, 0, 0), BackgroundTransparency: 1 });
        tween.Play();
        tween.Completed.Connect(() => {
            popupFrame.Visible = false;
            sparkleEffect.Enabled = false;
            sparkleEffect.Parent = undefined;
        });
    });
}

export default showRewardPopup

// Example usage:
// showRewardPopup("Golden Dragon", "rbxassetid://1234567890");
