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

function Home() {
  const [parameters, setParameters] = useState(defaultParameters);
  const [templateFile, setTemplateFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isLoading, setIsLoading] = useState(false);

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
    setSelectedTemplate("custom");
    setTemplateFile(e.target.files[0]);
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

    document.querySelector('form').reset();

    Object.keys(defaultParameters).forEach(key => {
      Cookies.remove(key);
    });
  };

  const editableFields = getEditableFields(selectedTemplate);
  const visibleFields = fieldConfigs.filter((field) => editableFields.includes(field.name));

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
