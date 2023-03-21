import { useState, useEffect } from "react";

export function useFuel() {
  const globalWindow = typeof window !== "undefined" ? window : ({} as Window);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [fuel, setFuel] = useState<Window["fuel"]>(globalWindow.fuel);

  useEffect(() => {
    // Create a timeout to make sure it fails
    // in case fuel wallet is not install / detected
    const timeoutNotFound = setTimeout(() => {
      setLoading(false);
      clearTimeout(timeoutNotFound);
      setError("fuel not detected on the window!");
    }, 1000);

    // On fuelLoaded event, set the fuel state and clear the timeout
    const onFuelLoaded = () => {
      setLoading(false);
      setFuel(globalWindow.fuel);
      clearTimeout(timeoutNotFound);
      setError("");
    };

    if (globalWindow.fuel) {
      onFuelLoaded();
    }

    // Listen for the fuelLoaded event
    document.addEventListener("FuelLoaded", onFuelLoaded);

    // On unmount, remove the event listener and clear the timeout
    return () => {
      document.removeEventListener("FuelLoaded", onFuelLoaded);
      clearTimeout(timeoutNotFound);
    };
  }, []);

  return [fuel as NonNullable<Window["fuel"]>, error, isLoading] as const;
}