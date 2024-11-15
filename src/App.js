import React, { useState } from "react";
import { saveAs } from "file-saver";

function App() {
  const [parameters, setParameters] = useState({
    subject: "",
    tracking_link: "",
    unsubscribe_link: "",
    filename: "",
    header: "",
    writeup: "",
    cta: "",
  });
  const [templateFile, setTemplateFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters({ ...parameters, [name]: value });
  };

  const handleFileChange = (e) => {
    setTemplateFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!templateFile) {
      alert("Please upload a template.html file!");
      return;
    }

    // Read the template file
    const reader = new FileReader();
    reader.onload = (event) => {
      const templateContent = event.target.result;

      // Replace placeholders in the template with parameters
      let outputHtml = templateContent;
      for (const key in parameters) {
        const placeholder = `{{ ${key} }}`;
        outputHtml = outputHtml.replace(new RegExp(placeholder, "g"), parameters[key]);
      }

      // Save the file
      const blob = new Blob([outputHtml], { type: "text/html;charset=utf-8" });
      saveAs(blob, "output.html");
    };

    reader.readAsText(templateFile);
  };

  return (
    <div className="container mt-3">
      <h1 className="text-center mb-3">HTML Generator</h1>
      <form onSubmit={handleFormSubmit}>
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
            required
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="templateFile" className="form-label">
            Template HTML
          </label>
          <input
            type="file"
            className="form-control"
            id="templateFile"
            accept=".html"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Generate HTML
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
