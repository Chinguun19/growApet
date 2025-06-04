import { Workspace, RunService } from "@rbxts/services";

const animalsFolder = Workspace.WaitForChild("Plots") as Folder;
const Plot1 = animalsFolder.WaitForChild("Plot1") as Model;
const areaCenter = new Vector3(-23.65, 4.8, 144.75);
const areaSize = new Vector3(50, 0, 50); // XZ only
const moveDelay = 5;

function getRandomPoint(): Vector3 {
	const x = math.random(-areaSize.X / 2, areaSize.X / 2);
	const z = math.random(-areaSize.Z / 2, areaSize.Z / 2);
	return areaCenter.add(new Vector3(x, 0, z));
}

function moveAnimal(animal: Model) {
	task.spawn(() => {
		const humanoid = animal.FindFirstChildOfClass("Humanoid");
		const root = animal.PrimaryPart;
		const animate = animal.FindFirstChild("Animate") as LocalScript;
		if (!humanoid || !root || !animate) return;

		const walkAnimObj = animate.FindFirstChild("walk")?.FindFirstChild("WalkAnim") as Animation;
		const idleAnimObj = animate.FindFirstChild("idle")?.FindFirstChild("Animation1") as Animation;
		if (!walkAnimObj || !idleAnimObj) return;

		let idleTrack = humanoid.LoadAnimation(idleAnimObj);
		idleTrack.Play();

		const loop = () => {
			const destination = getRandomPoint();

			// Play walk
			idleTrack.Stop();
			const walkTrack = humanoid.LoadAnimation(walkAnimObj);
			walkTrack.Play();

			// Face toward destination
			const direction = destination.sub(root.Position);
			const lookAt = new CFrame(root.Position, root.Position.add(direction.Unit));
			animal.SetPrimaryPartCFrame(lookAt);

			humanoid.MoveTo(destination);

			// Wait for arrival, then walk again
			humanoid.MoveToFinished.Once(() => {
				walkTrack.Stop();
				idleTrack = humanoid.LoadAnimation(idleAnimObj);
				idleTrack.Play();

				task.delay(moveDelay, loop); // Chain next move
			});
		};

		loop(); // start loop
	});
}

// Move all animals simultaneously
for (const animal of Plot1.GetChildren()) {
	if (animal.IsA("Model") && animal.PrimaryPart) {
		moveAnimal(animal);
	}
}
