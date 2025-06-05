// This is a TypeScript declaration file that enables TypeScript to understand and properly type image imports in your code. It tells TypeScript that when you import PNG, JPEG, or JPG files, they should be treated as strings (typically URLs or paths).

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}
