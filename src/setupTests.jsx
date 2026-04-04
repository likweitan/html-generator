import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, expect, vi } from "vitest";

expect.extend(matchers);

beforeAll(() => {
  if (!window.requestAnimationFrame) {
    vi.stubGlobal("requestAnimationFrame", (callback) => setTimeout(callback, 0));
  }

  if (!window.ResizeObserver) {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  }
});

afterEach(() => {
  cleanup();
});
