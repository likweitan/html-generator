import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { builtInTemplates } from "./utils/templateConfig";

const templateResponses = {
  "/template/1.html": `
    <!doctype html>
    <html>
      <body>
        <a href="{{ tracking_link }}">{{ filename }}</a>
        <h1>{{ subject }}</h1>
      </body>
    </html>
  `,
  "/template/2.html": `
    <!doctype html>
    <html>
      <body>
        <h1>{{ header }}</h1>
        <p>{{ writeup }}</p>
        <a href="{{ tracking_link }}">{{ cta }}</a>
        <footer>{{ filename }}</footer>
      </body>
    </html>
  `,
};

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");

  vi.restoreAllMocks();
  vi.spyOn(global, "fetch").mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : String(input);
    return {
      ok: true,
      text: async () => templateResponses[url] ?? templateResponses["/template/1.html"],
    };
  });

  Object.defineProperty(HTMLIFrameElement.prototype, "contentDocument", {
    configurable: true,
    get() {
      return document.implementation.createHTMLDocument("");
    },
  });
});

describe("App", () => {
  it("renders one generator link per configured built-in template", async () => {
    window.history.pushState({}, "", "/templates");

    render(<App />);

    const links = await screen.findAllByRole("link", { name: /open in generator/i });

    expect(links).toHaveLength(builtInTemplates.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      builtInTemplates.map((template) => `/?template=${template.id}`)
    );
  });

  it("loads the requested built-in template from the query string", async () => {
    window.history.pushState({}, "", "/?template=2");

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/template/2.html");
    });

    expect(await screen.findByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Writeup")).toBeInTheDocument();
    expect(screen.getByText("Call-to-Action (CTA)")).toBeInTheDocument();
  });
});
