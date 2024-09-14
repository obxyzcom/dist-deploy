import { add } from "./utils.js";
import { test, expect } from "vitest";

test("add", () => {
  expect(add(2, 4)).toBe(6);
});
