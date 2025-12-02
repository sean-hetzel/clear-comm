interface Leg {
  id: string;
  instruction?: string;
  readback?: string;
}

interface Scenario {
  id: string;
  name: string;
  paths: string[];
  legs: Leg[];
}
