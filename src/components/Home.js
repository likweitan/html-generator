import React, { useState, useEffect, useRef, useCallback } from "react";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";
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
    setParameters(defaultParameters);
    setSelectedTemplate("custom");
    setTemplateFile(null);
    setTemplateContent("");
    setCustomFields([]);

    document.querySelector("form").reset();

    Object.keys(defaultParameters).forEach((key) => {
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
      className: "form-control form-control-sm",
      id: field.name,
      name: field.name,
      value: parameters[field.name] || "",
      onChange: handleInputChange,
      required: field.required,
    };

    return (
      <div className="mb-2" key={field.name}>
        <label htmlFor={field.name} className="form-label mb-1 small fw-semibold">
          {field.label}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>
        {field.type === "textarea" ? (
          <textarea {...commonProps} rows={field.rows || 3}></textarea>
        ) : (
          <input type={field.type} {...commonProps} />
        )}
      </div>
    );
  };

  const hasPreview = !!templateContent;

  return (
    <div className="container-fluid px-4 mt-3">
      <div className="row g-3" style={{ height: "calc(100vh - 90px)" }}>
        {/* LEFT SIDE — Form Fields */}
        <div
          className={hasPreview ? "col-lg-4 col-md-5" : "col-12"}
          style={{ overflowY: "auto", height: "100%" }}
        >
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white py-2">
              <h6 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Template Fields
              </h6>
            </div>
            <div className="card-body" style={{ overflowY: "auto" }}>
              <form onSubmit={handleFormSubmit} id="templateForm">
                {/* Template Selector */}
                <div className="mb-2">
                  <label htmlFor="templateSelect" className="form-label mb-1 small fw-semibold">
                    Select Template
                  </label>
                  <select
                    className="form-select form-select-sm"
                    id="templateSelect"
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    disabled={isLoading}
                  >
                    {Object.entries(templates).map(
                      ([templateId, template]) => (
                        <option key={templateId} value={templateId}>
                          {template.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Custom file upload */}
                {selectedTemplate === "custom" && (
                  <div className="mb-2">
                    <label htmlFor="templateFile" className="form-label mb-1 small fw-semibold">
                      Upload Custom Template
                    </label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      id="templateFile"
                      accept=".html"
                      onChange={handleFileChange}
                      required={selectedTemplate === "custom"}
                    />
                    {customFields.length > 0 && (
                      <div className="mt-1">
                        <span className="badge bg-info text-dark">
                          {customFields.length} dynamic field
                          {customFields.length !== 1 ? "s" : ""} detected
                        </span>
                        <small className="text-muted ms-2">
                          {customFields.join(", ")}
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="text-center my-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small className="ms-2 text-muted">Loading template...</small>
                  </div>
                )}

                {/* Dynamic Fields */}
                <hr className="my-2" />
                <div className="row g-2">
                  {visibleFields.map((field) => (
                    <div
                      className={field.name === "writeup" ? "col-12" : "col-12"}
                      key={field.name}
                    >
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleClearAll}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isLoading}
                  >
                    <i className="bi bi-download me-1"></i>
                    Generate HTML
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Live Preview */}
        {hasPreview && (
          <div className="col-lg-8 col-md-7" style={{ height: "100%" }}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-eye me-2"></i>
                  Live Preview
                </h6>
                <span className="badge bg-success">Auto-updating</span>
              </div>
              <div className="card-body p-0" style={{ height: "calc(100% - 42px)" }}>
                <iframe
                  ref={iframeRef}
                  title="HTML Preview"
                  className="w-100 h-100 border-0"
                  sandbox="allow-same-origin"
                  style={{ backgroundColor: "#fff" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
