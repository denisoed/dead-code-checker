// Used enum
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}

// Unused enum - should be detected as dead code
enum UnusedEnum {
  Value1 = 'value1',
  Value2 = 'value2'
}

// Numeric enum - used
enum Direction {
  Up,
  Down,
  Left,
  Right
}

// Unused numeric enum - should be detected as dead code
enum UnusedDirection {
  North,
  South
}

// Const enum - used
const enum Size {
  Small = 'small',
  Large = 'large'
}

// Unused const enum - should be detected as dead code
const enum UnusedSize {
  Tiny = 'tiny',
  Huge = 'huge'
}

// Use enums
const color: Color = Color.Red;
const direction: Direction = Direction.Up;
const size: Size = Size.Small;

