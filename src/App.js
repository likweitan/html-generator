import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";

function App() {
  const [parameters, setParameters] = useState({
    subject: "",
    tracking_link: "",
    unsubscribe_link: "",
    filename: "",
    header: "",
    writeup: "",
    cta: "",
    cta_sentence: "", // New field
    cta_2: "", // New field
  });
  const [templateFile, setTemplateFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadedParams = {
      subject: Cookies.get("subject") || "",
      tracking_link: Cookies.get("tracking_link") || "",
      unsubscribe_link: Cookies.get("unsubscribe_link") || "",
      filename: Cookies.get("filename") || "",
      header: Cookies.get("header") || "",
      writeup: Cookies.get("writeup") || "",
      cta: Cookies.get("cta") || "",
      cta_sentence: Cookies.get("cta_sentence") || "", // Load from cookie
      cta_2: Cookies.get("cta_2") || "", // Load from cookie
    };
    setParameters(loadedParams);
  }, []);

  const handleTemplateChange = async (e) => {
    const selected = e.target.value;
    setSelectedTemplate(selected);
    
    if (selected !== "custom") {
      setIsLoading(true);
      try {
        const response = await fetch(`/template/${selected}.html`);
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

  const handleClearAll = () => {
    setParameters({
      subject: "",
      tracking_link: "",
      unsubscribe_link: "",
      filename: "",
      header: "",
      writeup: "",
      cta: "",
      cta_sentence: "",
      cta_2: "",
    });
    setSelectedTemplate("custom");
    setTemplateFile(null);

    Object.keys(parameters).forEach(key => {
      Cookies.remove(key);
    });
  };

  return (
    <>
      <header className="text-black text-center py-0">
        <h3>Cian</h3>
        <p>One and only.</p>
      </header>

      <div className="container mt-0">
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
              <option value="custom">Custom Template</option>
              <option value="1">Template 1</option>
              <option value="2">Template 2</option>
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
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="header" className="form-label">
                  Header
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="header"
                  name="header"
                  value={parameters.header}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={parameters.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label htmlFor="writeup" className="form-label">
                  Writeup
                </label>
                <textarea
                  className="form-control"
                  id="writeup"
                  name="writeup"
                  value={parameters.writeup}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="cta" className="form-label">
                  Call-to-Action (CTA)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cta"
                  name="cta"
                  value={parameters.cta}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="cta_sentence" className="form-label">
                  CTA Sentence
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cta_sentence"
                  name="cta_sentence"
                  value={parameters.cta_sentence}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="cta_2" className="form-label">
                  CTA 2
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cta_2"
                  name="cta_2"
                  value={parameters.cta_2}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="filename" className="form-label">
                  Filename
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="filename"
                  name="filename"
                  value={parameters.filename}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="trackingLink" className="form-label">
                  Tracking Link
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="trackingLink"
                  name="tracking_link"
                  value={parameters.tracking_link}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="unsubscribeLink" className="form-label">
                  Unsubscribe Link
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="unsubscribeLink"
                  name="unsubscribe_link"
                  value={parameters.unsubscribe_link}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
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
    </>
  );
}

export default App;