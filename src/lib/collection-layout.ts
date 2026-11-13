export type CollectionMenuPosition = "top" | "left";

export function collectionMenuPosition(value: unknown): CollectionMenuPosition {
  return value === "left" ? "left" : "top";
}