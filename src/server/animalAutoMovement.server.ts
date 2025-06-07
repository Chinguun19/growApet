import { Workspace, RunService } from "@rbxts/services";

const plotsFolder = Workspace.WaitForChild("Plots") as Folder;
const moveDelay = 5; // Time in seconds to wait before moving again
const random = new Random(); // Create a single Random object for better randomness

// --- 🧠 Helper: Get the bounds of the plot's walkable area ---
// 🎯 Note: Ensure your plot model has a part named "WalkableArea"
function getPlotBounds(plot: Model): { min: Vector3; max: Vector3 } | undefined {
    const walkableArea = plot.FindFirstChild("WalkableArea") as BasePart;
    
    if (!walkableArea || !walkableArea.IsA("BasePart")) {
        warn(`❌ No "WalkableArea" part found in plot "${plot.Name}"`);
        return undefined;
    }

    // This calculation creates a world-aligned bounding box (AABB)
    // It works best for non-rotated or slightly-rotated parts.
    const cframe = walkableArea.CFrame;
    const size = walkableArea.Size;
    
    const c0 = cframe.mul(new CFrame(size.X / 2, 0, size.Z / 2)).Position;
    const c1 = cframe.mul(new CFrame(-size.X / 2, 0, size.Z / 2)).Position;
    const c2 = cframe.mul(new CFrame(size.X / 2, 0, -size.Z / 2)).Position;
    const c3 = cframe.mul(new CFrame(-size.X / 2, 0, -size.Z / 2)).Position;

    const min = new Vector3(
        math.min(c0.X, c1.X, c2.X, c3.X),
        walkableArea.Position.Y - size.Y / 2,
        math.min(c0.Z, c1.Z, c2.Z, c3.Z)
    );

    const max = new Vector3(
        math.max(c0.X, c1.X, c2.X, c3.X),
        walkableArea.Position.Y + size.Y / 2,
        math.max(c0.Z, c1.Z, c2.Z, c3.Z)
    );

    print(`📏 WalkableArea bounds in "${plot.Name}": Min ${min}, Max ${max}`);
    return { min, max };
}

// --- 🧠 Helper: Get a random point inside the plot's bounds ---
function getRandomPointInPlot(plot: Model, bounds: { min: Vector3; max: Vector3 }): Vector3 {
    // Use NextNumber for floating-point coordinates, which is more natural
    const x = random.NextNumber(bounds.min.X, bounds.max.X);
    const z = random.NextNumber(bounds.min.Z, bounds.max.Z);
    const y = bounds.min.Y; // Use base Y level of the walkable area
    
    return new Vector3(x, y, z);
}

// --- 🐾 Main function to move an animal within its plot ---
function moveAnimal(animal: Model, plot: Model) {
    task.spawn(() => {
        const bounds = getPlotBounds(plot);
        if (!bounds) return; // Stop if the plot has no valid WalkableArea

        const humanoid = animal.FindFirstChildOfClass("Humanoid");
        const root = animal.PrimaryPart;

        // ❗ Important: Make sure the animal's PrimaryPart (usually HumanoidRootPart) is NOT anchored!
        if (!humanoid || !root) {
            warn(`❌ Invalid animal model: "${animal.Name}" is missing a Humanoid or PrimaryPart.`);
            return;
        }

        // Set properties for autonomous movement
        humanoid.AutoRotate = true; // Let the humanoid turn automatically
        humanoid.WalkSpeed = 8; // Adjust speed as needed

        // --- Load Animations ---
        const animator = humanoid.FindFirstChildOfClass("Animator");
        if (!animator) {
             warn(`❌ Animator not found for animal "${animal.Name}"`);
             return;
        }
        
        const idleAnim = animator.FindFirstChild("IdleAnim") as Animation;
        const walkAnim = animator.FindFirstChild("WalkAnim") as Animation;


        const idleTrack = animator.LoadAnimation(idleAnim);
        const walkTrack = animator.LoadAnimation(walkAnim);

        // --- Main Movement Loop ---
        const loop = () => {
            // Get a random destination inside the bounds
            const destination = getRandomPointInPlot(plot, bounds);

            // Play walk animation and move
            idleTrack.Stop();
            walkTrack.Play();
            humanoid.MoveTo(destination);

            // Wait until the movement is finished (or fails)
            humanoid.MoveToFinished.Wait();
            
            // Stop and play idle animation
            walkTrack.Stop();
            idleTrack.Play();

            // Wait for the delay, then start the next movement
            task.wait(moveDelay);
            loop(); // Call the loop again
        };

        // Start the first loop
        idleTrack.Play(); // Start by being idle
        task.wait(random.NextNumber(0, moveDelay)); // Add a random initial delay
        loop();
    });
}


// --- 🔁 Connect the logic to all current and future animals ---
function setupPlot(plot: Model) {
    // Handle animals already in the plot when the script runs
    for (const child of plot.GetChildren()) {
        if (child.IsA("Model")) {
            moveAnimal(child, plot);
        }
    }

    // Listen for new animals that are added later
    plot.ChildAdded.Connect((child) => {
        if (child.IsA("Model")) {
            print(`🐣 New animal "${child.Name}" added to plot "${plot.Name}"`);
            moveAnimal(child, plot);
        }
    });
}

// --- 🔃 Initial script execution ---
for (const plot of plotsFolder.GetChildren()) {
    if (plot.IsA("Model")) {
        setupPlot(plot);
    }
}