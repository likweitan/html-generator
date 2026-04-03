import React, { useState, useEffect } from "react";
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
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isLoading, setIsLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const loadedParams = Object.keys(defaultParameters).reduce((acc, key) => {
      acc[key] = Cookies.get(key) || defaultParameters[key];
      return acc;
    }, {});
    setParameters(loadedParams);
  }, []);

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
        if (!response.ok) throw new Error('Failed to load template');
        const blob = await response.blob();
        setTemplateFile(new File([blob], `${selected}.html`, { type: 'text/html' }));
      } catch (error) {
        console.error('Error loading template:', error);
        alert('Failed to load template. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setTemplateFile(null);
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

    const reader = new FileReader();
    reader.onload = (event) => {
      let outputHtml = event.target.result;
      for (const key in parameters) {
        const placeholder = `{{ ${key} }}`;
        outputHtml = outputHtml.replace(new RegExp(placeholder, "g"), parameters[key]);
      }

      const blob = new Blob([outputHtml], { type: "text/html;charset=utf-8" });
      saveAs(blob, parameters.filename ? `${parameters.filename}.html` : "output.html");
    };

    reader.readAsText(templateFile);
  };

  const handleClearAll = (e) => {
    setParameters(defaultParameters);
    setSelectedTemplate("custom");
    setTemplateFile(null);
    setCustomFields([]);

    document.querySelector('form').reset();

    Object.keys(defaultParameters).forEach(key => {
      Cookies.remove(key);
    });
  };

  const editableFields = getEditableFields(selectedTemplate);

  // For custom templates with an uploaded file, use the detected fields
  let visibleFields;
  if (selectedTemplate === "custom" && customFields.length > 0) {
    // Build field configs dynamically from detected placeholders
    visibleFields = customFields.map((fieldName) => {
      // Use existing field config if available, otherwise create one dynamically
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
    visibleFields = fieldConfigs.filter((field) => editableFields.includes(field.name));
  }

  const renderField = (field) => {
    const commonProps = {
      className: "form-control",
      id: field.name,
      name: field.name,
      value: parameters[field.name] || "",
      onChange: handleInputChange,
      required: field.required,
    };

    return (
      <div className="mb-3" key={field.name}>
        <label htmlFor={field.name} className="form-label">
          {field.label}
        </label>
        {field.type === "textarea" ? (
          <textarea {...commonProps} rows={field.rows || 4}></textarea>
        ) : (
          <input type={field.type} {...commonProps} />
        )}
      </div>
    );
  };

  const getFieldColumnClass = (fieldName) => {
    if (fieldName === "writeup") {
      return "col-md-12";
    }

    return "col-md-6";
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <label htmlFor="templateSelect" className="form-label">
            Select Template
          </label>
          <select
            className="form-select"
            id="templateSelect"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            disabled={isLoading}
          >
            {Object.entries(templates).map(([templateId, template]) => (
              <option key={templateId} value={templateId}>
                {template.label}
              </option>
            ))}
          </select>
        </div>

        {selectedTemplate === "custom" && (
          <div className="mb-3">
            <label htmlFor="templateFile" className="form-label">
              Upload Custom Template
            </label>
            <input
              type="file"
              className="form-control"
              id="templateFile"
              accept=".html"
              onChange={handleFileChange}
              required={selectedTemplate === "custom"}
            />
            {customFields.length > 0 && (
              <div className="mt-2">
                <span className="badge bg-info text-dark">
                  {customFields.length} dynamic field{customFields.length !== 1 ? "s" : ""} detected
                </span>
                <small className="text-muted ms-2">
                  {customFields.join(", ")}
                </small>
              </div>
            )}
          </div>
        )}

        <div className="row">
          {visibleFields.map((field) => (
            <div className={getFieldColumnClass(field.name)} key={field.name}>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end">
          <div className="me-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearAll}
            >
              Clear
            </button>
          </div>
          <div className="me-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              Generate HTML
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Home;
