import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// This project runs vitest without `globals`, so Testing Library cannot
// register its own automatic cleanup -- without this, renders from one
// test stay mounted and later queries match several elements at once.
afterEach(() => {
  cleanup();
});
