import React from "react";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import { builtInTemplates } from "../utils/templateConfig";

function Templates() {
  return (
    <div className="container mx-auto p-4 max-w-7xl mt-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Available Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {builtInTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col"
          >
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">{template.label}</h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-muted-foreground text-sm">
                Opens this template in the generator with its live preview ready.
              </p>
            </div>
            <div className="p-6 pt-0 mt-auto flex items-center">
              <Button asChild>
                <Link to={`/?template=${template.id}`}>Open in generator</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Templates;
