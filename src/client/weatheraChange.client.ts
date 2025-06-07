import { ReplicatedStorage, Lighting, Workspace } from "@rbxts/services";

const WeatherChangedEvent = ReplicatedStorage.WaitForChild("WeatherChangedEvent") as RemoteEvent;

enum WeatherType {
  Clear = "Clear",
  Rain = "Rain",
  Snow = "Snow",
  Storm = "Storm",
  Sunny = "Sunny",
}

let rainParticle: ParticleEmitter | undefined;
let snowParticle: ParticleEmitter | undefined;

function createWeatherParticles() {
  const rainPart = new Instance("Part");
  rainPart.Name = "RainParticles";
  rainPart.Anchored = true;
  rainPart.CanCollide = false;
  rainPart.Transparency = 1;
  rainPart.Size = new Vector3(1000, 1, 1000);
  rainPart.CFrame = Workspace.CurrentCamera!.CFrame.mul(new CFrame(0, 50, 0));
  rainPart.Parent = Workspace;

  rainParticle = new Instance("ParticleEmitter");
  rainParticle.Texture = "rbxassetid://1234567"; // Replace with raindrop texture
  rainParticle.Speed = new NumberRange(50, 70);
  rainParticle.Lifetime = new NumberRange(0.5, 1);
  rainParticle.Rate = 1000;
  rainParticle.Parent = rainPart;

  const snowPart = new Instance("Part");
  snowPart.Name = "SnowParticles";
  snowPart.Anchored = true;
  snowPart.CanCollide = false;
  snowPart.Transparency = 1;
  snowPart.Size = new Vector3(1000, 1, 1000);
  snowPart.CFrame = Workspace.CurrentCamera!.CFrame.mul(new CFrame(0, 50, 0));
  snowPart.Parent = Workspace;

  snowParticle = new Instance("ParticleEmitter");
  snowParticle.Texture = "rbxassetid://2345678"; // Replace with snowflake texture
  snowParticle.Speed = new NumberRange(10, 20);
  snowParticle.Lifetime = new NumberRange(2, 4);
  snowParticle.Rate = 500;
  snowParticle.Parent = snowPart;
}

function setWeather(weather: WeatherType) {
  switch (weather) {
    case WeatherType.Clear:
    case WeatherType.Sunny:
      if (rainParticle) rainParticle.Enabled = false;
      if (snowParticle) snowParticle.Enabled = false;
      break;
    case WeatherType.Rain:
    case WeatherType.Storm:
      if (rainParticle) rainParticle.Enabled = true;
      if (snowParticle) snowParticle.Enabled = false;
      break;
    case WeatherType.Snow:
      if (rainParticle) rainParticle.Enabled = false;
      if (snowParticle) snowParticle.Enabled = true;
      break;
  }
}

WeatherChangedEvent.OnClientEvent.Connect(setWeather);

createWeatherParticles();
