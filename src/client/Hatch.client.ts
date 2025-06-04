import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";

const plr  = Players.LocalPlayer;
const mouse = plr.GetMouse();


const indicator = ReplicatedStorage.WaitForChild("Indicator") as Part;
indicator.Parent = undefined
indicator.Name = tostring(plr.UserId);


function hasSeed(): boolean {
    const character = plr.Character
    if (!character) return false;

    for (const item of character.GetChildren()) {
        if (item.IsA("Tool") && item.HasTag("Seed")) {
            return true;
        }
    }
    return false;
}

mouse.Move.Connect(() => {
    if(!mouse.Target) return;
    if(!mouse.Target.HasTag("Hatchable")) return;
    if(!hasSeed()) return;

    const target = mouse.Target;
    const targetUserId = target.Parent?.GetAttribute("USERID");
if(target.HasTag("Hatchable") && targetUserId && targetUserId !== plr.UserId) {
       return false;
    }
    else if(target.HasTag("Hatchable") && targetUserId === plr.UserId) {
        indicator.Parent = Workspace;
        indicator.Position = mouse.Hit.Position;
       
        indicator.Color = Color3.fromRGB(0, 255, 0);
    }
    else {
        indicator.Parent = undefined;
    }
});1

mouse.Button1Down.Connect(() => {
	if (indicator.Parent !== undefined) {
		const character = plr.Character;
		if (!character) return;

		const seedTool = character.FindFirstChildWhichIsA("Tool");
		if (seedTool && seedTool.HasTag("Seed")) {
            const sound = new Instance("Sound", game.Workspace);
            sound.SoundId = "rbxassetid://129498682589344"; // Replace with actual sound ID
			const plantSeedEvent = ReplicatedStorage.WaitForChild("RemoteEvents").WaitForChild("PlantSeed") as RemoteEvent;
			plantSeedEvent.FireServer(seedTool, indicator.Position);
            sound.Play();
            indicator.Parent = undefined; // Remove indicator after planting

		}
	}
});
