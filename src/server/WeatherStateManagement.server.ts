import { ReplicatedStorage, RunService, Lighting } from "@rbxts/services";

export enum WeatherType {
  Clear = "Clear",
  Rain = "Rain",
  Snow = "Snow",
  Storm = "Storm",
  Sunny = "Sunny",
}

const WeatherChangedEvent = new Instance("RemoteEvent");
WeatherChangedEvent.Name = "WeatherChangedEvent";
WeatherChangedEvent.Parent = ReplicatedStorage;

let currentWeather = WeatherType.Clear;
let growthModifier = 1;

function setWeather(weather: WeatherType) {
  currentWeather = weather;

  switch (weather) {
    case WeatherType.Clear:
      growthModifier = 1;
      Lighting.FogEnd = 1000;
      Lighting.Brightness = 2;
      break;
    case WeatherType.Rain:
      growthModifier = 0.9;
      Lighting.FogEnd = 300;
      Lighting.Brightness = 1.2;
      break;
    case WeatherType.Snow:
      growthModifier = 0.7;
      Lighting.FogEnd = 250;
      Lighting.Brightness = 1.5;
      break;
    case WeatherType.Storm:
      growthModifier = 0.6;
      Lighting.FogEnd = 200;
      Lighting.Brightness = 0.7;
      break;
    case WeatherType.Sunny:
      growthModifier = 1.1;
      Lighting.FogEnd = 1200;
      Lighting.Brightness = 3;
      break;
  }

  WeatherChangedEvent.FireAllClients(weather);
  print(`Weather changed to ${weather}, growth modifier set to ${growthModifier}`);
}

export function getGrowthModifier() {
  return growthModifier;
}

// Auto cycle weather every 5 minutes
task.spawn(() => {
  const weatherCycle = [
    WeatherType.Clear,
    WeatherType.Rain,
    WeatherType.Sunny,
    WeatherType.Storm,
    WeatherType.Snow,
  ];

  let index = 0;
  while (true) {
    setWeather(weatherCycle[index]);
    index = (index + 1) % weatherCycle.size();
    task.wait(300); // 5 minutes
  }
});
