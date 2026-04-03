import React, { useState, useEffect, useRef, useCallback } from "react";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";
import { Edit, Eye, Download, Sparkles, Layers, Box, Wand2, X, Upload, GitBranch, Eraser } from "lucide-react";
import {
  defaultParameters,
  fieldConfigs,
  getEditableFields,
  getTemplateDefaults,
  templates,
} from "../utils/templateConfig";

/**
 * Parse an HTML template string and extract all {{ field_name }} placeholders.
 * Returns an array of unique field names found in the template.
 */
function extractTemplatePlaceholders(htmlContent) {
  const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  const fields = new Set();
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    fields.add(match[1]);
  }
  return Array.from(fields);
}

/**
 * Convert a snake_case or camelCase field name into a human-readable label.
 * e.g. "tracking_link" -> "Tracking Link", "firstName" -> "First Name"
 */
function fieldNameToLabel(name) {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Home() {
  const [parameters, setParameters] = useState(defaultParameters);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateContent, setTemplateContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isLoading, setIsLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadedParams = Object.keys(defaultParameters).reduce((acc, key) => {
      acc[key] = Cookies.get(key) || defaultParameters[key];
      return acc;
    }, {});
    setParameters(loadedParams);
  }, []);

  // Generate the preview HTML by replacing placeholders with current parameter values
  const generatePreviewHtml = useCallback(() => {
    if (!templateContent) return "";
    let outputHtml = templateContent;
    for (const key in parameters) {
      const placeholder = `{{ ${key} }}`;
      outputHtml = outputHtml.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), parameters[key] || "");
    }
    return outputHtml;
  }, [templateContent, parameters]);

  // Update iframe preview whenever parameters or template content change
  useEffect(() => {
    const previewHtml = generatePreviewHtml();
    if (iframeRef.current && previewHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(previewHtml);
      doc.close();
    }
  }, [generatePreviewHtml]);

  const handleTemplateChange = async (e) => {
    const selected = e.target.value;
    setSelectedTemplate(selected);
    const templateDefaults = getTemplateDefaults(selected);
    setParameters(templateDefaults);

    Object.entries(templateDefaults).forEach(([key, value]) => {
      Cookies.set(key, value, { expires: 7 });
    });

    if (selected !== "custom") {
      setCustomFields([]);
      setIsLoading(true);
      try {
        const response = await fetch(templates[selected].htmlFile);
        if (!response.ok) throw new Error("Failed to load template");
        const text = await response.text();
        setTemplateContent(text);
        const blob = new Blob([text], { type: "text/html" });
        setTemplateFile(
          new File([blob], `${selected}.html`, { type: "text/html" })
        );
      } catch (error) {
        console.error("Error loading template:", error);
        alert("Failed to load template. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setTemplateFile(null);
      setTemplateContent("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters((prevParams) => {
      const updatedParams = { ...prevParams, [name]: value };
      Cookies.set(name, value, { expires: 7 });
      return updatedParams;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedTemplate("custom");
    setTemplateFile(file);

    // Read the uploaded file and extract {{ placeholder }} fields
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setTemplateContent(content);
      const detectedFields = extractTemplatePlaceholders(content);
      setCustomFields(detectedFields);

      // Initialize parameters for any newly detected fields
      setParameters((prev) => {
        const updated = { ...prev };
        detectedFields.forEach((fieldName) => {
          if (!(fieldName in updated)) {
            updated[fieldName] = "";
          }
        });
        return updated;
      });
    };
    reader.readAsText(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!templateFile && selectedTemplate === "custom") {
      alert("Please select a template or upload a custom template file!");
      return;
    }

    const previewHtml = generatePreviewHtml();
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    saveAs(
      blob,
      parameters.filename ? `${parameters.filename}.html` : "output.html"
    );
  };

  const handleClearAll = () => {
    // Reset field values to defaults but keep the active template intact
    const clearedParams = Object.keys(parameters).reduce((acc, key) => {
      acc[key] = defaultParameters[key] ?? "";
      return acc;
    }, {});
    setParameters(clearedParams);

    Object.keys(clearedParams).forEach((key) => {
      Cookies.remove(key);
    });
  };

  const editableFields = getEditableFields(selectedTemplate);

  // For custom templates with an uploaded file, use the detected fields
  let visibleFields;
  if (selectedTemplate === "custom" && customFields.length > 0) {
    visibleFields = customFields.map((fieldName) => {
      const existingConfig = fieldConfigs.find((f) => f.name === fieldName);
      if (existingConfig) return existingConfig;
      return {
        name: fieldName,
        label: fieldNameToLabel(fieldName),
        type: "text",
        required: false,
      };
    });
  } else {
    visibleFields = fieldConfigs.filter((field) =>
      editableFields.includes(field.name)
    );
  }

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: parameters[field.name] || "",
      onChange: handleInputChange,
      required: field.required,
      className: "mt-1.5",
    };

    return (
      <div className="grid gap-1.5 group" key={field.name}>
        <label htmlFor={field.name} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        {field.type === "textarea" ? (
          <textarea 
            className="flex min-h-[80px] w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 hover:bg-background/80" 
            {...commonProps} 
            rows={field.rows || 3} 
          />
        ) : (
          <input 
            className="flex h-10 w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 hover:bg-background/80" 
            type={field.type} 
            {...commonProps} 
          />
        )}
      </div>
    );
  };

  const hasPreview = !!templateContent;

  return (
    <div className="h-screen overflow-hidden bg-[#0E0E0E] text-[#D1D5DB] font-sans flex flex-col">
      {/* HEADER */}
      <header className="flex h-14 items-center justify-between px-4 border-b border-white/10">
        <div className="font-semibold text-[15px] text-white">Scaffl</div>
        <div className="flex items-center gap-2">
          <select
            className="bg-[#2A2A2A] text-white text-[13px] rounded px-3 py-1.5 border border-white/5 outline-none hover:bg-[#333333] transition-colors min-w-[150px]"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            disabled={isLoading}
          >
            <option value="custom" disabled hidden>Load a preset...</option>
            {Object.entries(templates).map(([templateId, template]) => (
              <option key={templateId} value={templateId}>
                {template.label}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <button onClick={handleFormSubmit} disabled={isLoading || !hasPreview} className="bg-[#2A2A2A] hover:bg-[#333333] text-[13px] px-3 py-1.5 rounded border border-white/5 transition-colors text-white disabled:opacity-50">Save</button>
          <button onClick={() => setShowCodeModal(true)} disabled={!hasPreview} className="bg-[#2A2A2A] hover:bg-[#333333] text-[13px] px-3 py-1.5 rounded border border-white/5 transition-colors text-white disabled:opacity-50">View code</button>
          <button className="bg-[#2A2A2A] hover:bg-[#333333] text-[13px] px-3 py-1.5 rounded border border-white/5 transition-colors text-white">Share</button>
          <a href="https://github.com/likweitan/scaffl" target="_blank" rel="noopener noreferrer" className="bg-[#2A2A2A] hover:bg-[#333333] text-[13px] px-3 py-1.5 rounded border border-white/5 transition-colors text-white flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden bg-[#0E0E0E]">
        {!hasPreview ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative group cursor-pointer flex flex-col items-center justify-center py-20 px-4 w-full max-w-lg">
              <input type="file" className="absolute inset-0 z-30 opacity-0 cursor-pointer" accept=".html" onChange={handleFileChange} />
              <div className="w-[88px] h-[88px] bg-[#1A1A1A] rounded-[24px] flex items-center justify-center mb-8 shadow-xl transition-colors group-hover:bg-[#252525] border border-white/5">
                <Upload className="w-10 h-10 text-gray-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-white font-bold text-[22px] tracking-tight mb-2">Upload your files</h3>
              <p className="text-gray-400 text-[16px] mb-2 pointer-events-none">Drag and drop your files here or click to browse</p>
              <p className="text-gray-500 text-[13px] pointer-events-none">Up to 10 files, 50MB each (Only HTML templates)</p>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT SIDE — Main Canvas */}
            <div className="w-1/2 flex flex-col relative px-4 py-4 border-r border-white/10 bg-[#0a0a0a]">
              <div className="w-full max-w-4xl mx-auto flex-1 rounded-md border border-white/10 overflow-hidden relative bg-transparent flex flex-col shadow-lg">
                <div className="w-full h-full bg-white relative">
                   <iframe
                    ref={iframeRef}
                    title="HTML Preview"
                    className="w-full h-full border-0 absolute inset-0 block bg-white text-black"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE — Sidebar Settings */}
            <div className="w-1/2 bg-[#0E0E0E] flex flex-col overflow-y-auto p-6 custom-scrollbar">
              <div className="mb-6 space-y-1.5 group relative">
                <div className="text-[13px] text-gray-300">Active Template</div>
                <button className="w-full bg-[#1A1A1A] border border-white/10 rounded px-3 py-1.5 text-[13px] text-left text-white flex justify-between items-center hover:bg-[#2A2A2A] transition-colors relative">
                   <span className="truncate pr-4">{templateFile ? templateFile.name : "Custom File..."}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><polyline points="6 9 12 15 18 9"></polyline></svg>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".html" onChange={handleFileChange} />
                </button>
                {customFields.length > 0 && selectedTemplate === "custom" && (
                    <div className="text-[11px] text-green-400 mt-1">
                      Detected {customFields.length} dynamic field(s).
                    </div>
                )}
                {isLoading && <div className="text-[11px] text-gray-400 mt-1">Loading...</div>}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">Fields</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all field values"
                  className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <div className="space-y-6">
                {visibleFields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-gray-300 flex justify-between">
                      {field.label}
                      {field.type === 'number' && <span className="text-gray-500">{parameters[field.name] || 0}</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        value={parameters[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-2 py-1.5 text-[13px] focus:outline-none focus:border-white text-white resize-y"
                        rows={field.rows || 3}
                      />
                    ) : field.type === "number" || field.type === "range" ? (
                      <div className="relative pt-1">
                        <input 
                          type="range"
                          id={field.name}
                          name={field.name}
                          min="0"
                          max="100"
                          value={parameters[field.name] || 0}
                          onChange={handleInputChange}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        value={parameters[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-2 py-1.5 text-[13px] focus:outline-none focus:border-white text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#1A1A1A] rounded-t-lg">
              <h2 className="text-white font-medium text-[14px]">Generated Code</h2>
              <button onClick={() => setShowCodeModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-[#0E0E0E]">
              <pre className="text-[13px] text-gray-300 font-mono whitespace-pre-wrap break-all">
                {generatePreviewHtml()}
              </pre>
            </div>
            <div className="p-3 border-t border-white/10 flex justify-end gap-2 bg-[#1A1A1A] rounded-b-lg">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatePreviewHtml());
                }} 
                className="bg-[#2A2A2A] hover:bg-[#333333] text-white px-4 py-1.5 rounded text-[13px] border border-white/5 transition-colors"
              >
                Copy
              </button>
              <button 
                onClick={() => setShowCodeModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-[13px] transition-colors font-medium border border-green-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
