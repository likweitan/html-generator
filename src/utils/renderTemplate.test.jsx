import { describe, expect, it } from "vitest";

import { renderTemplate } from "./renderTemplate";

describe("renderTemplate", () => {
  it("renders handlebars placeholders without requiring surrounding whitespace", () => {
    const output = renderTemplate(
      "<h1>{{subject}}</h1><p>{{ writeup }}</p>",
      {
        subject: "Whitespace-free placeholder",
        writeup: "Rendered through Handlebars",
      }
    );

    expect(output).toContain("Whitespace-free placeholder");
    expect(output).toContain("Rendered through Handlebars");
    expect(output).not.toContain("{{subject}}");
    expect(output).not.toContain("{{ writeup }}");
  });
});
