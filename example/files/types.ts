// Used type alias
type Point = {
  x: number;
  y: number;
};

// Unused type alias - should be detected as dead code
type UnusedType = {
  value: string;
};

// Used type in function
function getDistance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Unused type in function - should be detected as dead code
function unusedFunction(param: UnusedType): void {
  // unused
}

// Union type - used
type Status = 'active' | 'inactive' | 'pending';

// Unused union type - should be detected as dead code
type UnusedStatus = 'a' | 'b' | 'c';

// Intersection type - used
type Person = {
  name: string;
};

type Employee = Person & {
  id: number;
};

// Unused intersection - should be detected as dead code
type UnusedCombined = Person & {
  extra: string;
};

// Use types
const point1: Point = { x: 0, y: 0 };
const point2: Point = { x: 3, y: 4 };
getDistance(point1, point2);

const status: Status = 'active';
const employee: Employee = { name: 'John', id: 1 };

