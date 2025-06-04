import { Workspace } from "@rbxts/services";

const plotsFolder = Workspace.WaitForChild("Plots") as Folder;
const moveDelay = 5;

// 🧠 Helper: Get plot bounds
// 🎯 Get bounds ONLY from the "WalkableArea" part
function getPlotBounds(plot: Model): { min: Vector3; max: Vector3 } | undefined {
    const walkableArea = plot.FindFirstChild("Hatchable") as BasePart;
    
    if (!walkableArea || !walkableArea.IsA("BasePart")) {
        warn(`❌ No "WalkableArea" part found in plot "${plot.Name}"`);
        return undefined;
    }

    const cframe = walkableArea.CFrame;
    const size = walkableArea.Size.div(2); // Half-size for bounds
    
    const min = cframe.Position.sub(size);
    const max = cframe.Position.add(size);

    print(`📏 WalkableArea bounds in "${plot.Name}": Min ${min}, Max ${max}`);
    return { min, max };
}

// 🔍 Check if a position is inside the WalkableArea bounds
function isInBounds(position: Vector3, bounds: { min: Vector3; max: Vector3 }): boolean {
    return (
        position.X >= bounds.min.X &&
        position.X <= bounds.max.X &&
        position.Z >= bounds.min.Z &&
        position.Z <= bounds.max.Z
    );
}


// 🧠 Helper: Get random point inside plot
function getRandomPointInPlot(plot: Model): Vector3 | undefined {
    const bounds = getPlotBounds(plot);
    if (!bounds) return undefined; // Skip if no WalkableArea

    const x = math.random(bounds.min.X, bounds.max.X);
    const z = math.random(bounds.min.Z, bounds.max.Z);
    const y = bounds.min.Y; // Use base Y level
    return new Vector3(x, y, z);
}

// 🐾 Move an animal within its plot
function moveAnimal(animal: Model, plot: Model) {
    task.spawn(() => {
        const bounds = getPlotBounds(plot);
        if (!bounds) return; // Skip if no WalkableArea

        const humanoid = animal.FindFirstChildOfClass("Humanoid");
        const root = animal.PrimaryPart;
        const animate = animal.FindFirstChild("Animate") as LocalScript;
        
        if (!humanoid || !root || !animate) {
            warn(`❌ Invalid animal model: "${animal.Name}"`);
            return;
        }

        // Animation setup (same as before)
        const walkAnim = animate.FindFirstChild("walk")?.FindFirstChild("WalkAnim") as Animation;
        const idleAnim = animate.FindFirstChild("idle")?.FindFirstChild("IdleAnim") as Animation;
        let idleTrack = humanoid.LoadAnimation(idleAnim);
        idleTrack.Play();

        const loop = () => {
            // 1. Get a random destination INSIDE bounds
            let destination = getRandomPointInPlot(plot)!;

            // 2. Verify current position
            if (!isInBounds(root.Position, bounds)) {
                // Animal escaped! Force it back inside
                destination = new Vector3(
                    (bounds.min.X + bounds.max.X) / 2, // Center X
                    bounds.min.Y,                      // Base Y
                    (bounds.min.Z + bounds.max.Z) / 2   // Center Z
                );
                print(`⚠️ Animal "${animal.Name}" was outside bounds! Returning to center.`);
            }

            // 3. Proceed with movement (your existing code)
            idleTrack.Stop();
            const walkTrack = humanoid.LoadAnimation(walkAnim);
            walkTrack.Play();

            const direction = destination.sub(root.Position);
            animal.SetPrimaryPartCFrame(new CFrame(root.Position, root.Position.add(direction.Unit)));
            humanoid.MoveTo(destination);

            // 4. After reaching destination, loop again
            humanoid.MoveToFinished.Once(() => {
                walkTrack.Stop();
                idleTrack = humanoid.LoadAnimation(idleAnim);
                idleTrack.Play();
                task.delay(moveDelay, loop);
            });
        };

        loop();
    });
}

// 🔁 Handle new animals added to plots
function handleAnimal(animal: Instance, plot: Model) {
	if (animal.IsA("Model") && animal.PrimaryPart && animal.FindFirstChildOfClass("Humanoid")) {
		print(`🐣 New animal "${animal.Name}" detected in plot "${plot.Name}"`);
		moveAnimal(animal, plot);
	
}
}

// 🔃 Initial + runtime loop
for (const plot of plotsFolder.GetChildren()) {
	if (!plot.IsA("Model")) continue;

	// Handle animals already in the plot
	for (const child of plot.GetChildren()) {
		handleAnimal(child, plot);
	}

	// Listen for new animals added later
	plot.ChildAdded.Connect((child) => {
		handleAnimal(child, plot);
	});
}
