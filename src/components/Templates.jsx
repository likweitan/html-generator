import React from 'react';

function Templates() {
  return (
    <div className="container mx-auto p-4 max-w-7xl mt-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Available Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Template 1</h3>
          </div>
          <div className="p-6 pt-0">
            <p className="text-muted-foreground text-sm">A clean, professional template suitable for general announcements and updates.</p>
          </div>
          <div className="p-6 pt-0 mt-auto flex items-center">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Preview Template
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Template 2</h3>
          </div>
          <div className="p-6 pt-0">
            <p className="text-muted-foreground text-sm">A modern, visually appealing template perfect for marketing campaigns.</p>
          </div>
          <div className="p-6 pt-0 mt-auto flex items-center">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Preview Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Templates;