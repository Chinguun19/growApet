import { Players, RunService } from "@rbxts/services";
import { Workspace } from "@rbxts/services";

interface FollowingData {
    connection: RBXScriptConnection;
}

const followingAnimals = new Map<Tool, FollowingData>();

function startFollowing(tool: Tool, player: Player) {
    const animalModel = tool.FindFirstChildWhichIsA("Model");
    if (!animalModel) return;

    const humanoid = animalModel.FindFirstChildOfClass("Humanoid");
    if (!humanoid) return;

    const character = player.Character;
    if (!character) return;

    const hrp = character.FindFirstChild("HumanoidRootPart") as BasePart;
    if (!hrp) return;

    // Parent animal to workspace to move freely
    animalModel.Parent = Workspace;

    const conn = RunService.Heartbeat.Connect(() => {
        const targetPos = hrp.Position.add(new Vector3(3, 0, 3));
        humanoid.MoveTo(targetPos);
    });

    followingAnimals.set(tool, { connection: conn });
}

function stopFollowing(tool: Tool) {
    const data = followingAnimals.get(tool);
    if (data) {
        data.connection.Disconnect();
        followingAnimals.delete(tool);
    }
}

Players.PlayerAdded.Connect(player => {
    player.CharacterAdded.Connect(character => {
        const backpack = player.WaitForChild("Backpack") as Backpack;

        // Listen for tools equipped
        backpack.ChildAdded.Connect(tool => {
            if (!tool.IsA("Tool")) return;

            tool.Equipped.Connect(() => startFollowing(tool, player));
            tool.Unequipped.Connect(() => stopFollowing(tool));
        });

        // Also check tools already in backpack on spawn
        for (const tool of backpack.GetChildren()) {
            if (tool.IsA("Tool")) {
                tool.Equipped.Connect(() => startFollowing(tool, player));
                tool.Unequipped.Connect(() => stopFollowing(tool));
            }
        }
    });
});

// Cleanup when player leaves
Players.PlayerRemoving.Connect(player => {
    // Stop all animals following this player
    for (const [tool, data] of followingAnimals) {
        const backpack = player.FindFirstChild("Backpack");
        if (tool.Parent === backpack) {
            data.connection.Disconnect();
            followingAnimals.delete(tool);
        }
    }
});
