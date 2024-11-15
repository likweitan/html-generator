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
  });
  const [templateFile, setTemplateFile] = useState(null);

  useEffect(() => {
    // Load form values from cookies on component mount
    const loadedParams = {
      subject: Cookies.get("subject") || "",
      tracking_link: Cookies.get("tracking_link") || "",
      unsubscribe_link: Cookies.get("unsubscribe_link") || "",
      filename: Cookies.get("filename") || "",
      header: Cookies.get("header") || "",
      writeup: Cookies.get("writeup") || "",
      cta: Cookies.get("cta") || "",
    };
    setParameters(loadedParams);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters((prevParams) => {
      const updatedParams = { ...prevParams, [name]: value };
      // Save to cookies each time the user updates a field
      Cookies.set(name, value, { expires: 7 }); // cookies expire in 7 days
      return updatedParams;
    });
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

  const handleClearAll = () => {
    // Clear all form values
    setParameters({
      subject: "",
      tracking_link: "",
      unsubscribe_link: "",
      filename: "",
      header: "",
      writeup: "",
      cta: "",
    });

    // Delete cookies
    Cookies.remove("subject");
    Cookies.remove("tracking_link");
    Cookies.remove("unsubscribe_link");
    Cookies.remove("filename");
    Cookies.remove("header");
    Cookies.remove("writeup");
    Cookies.remove("cta");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-white text-center py-3">
        <h1>HTML Generator Tool</h1>
        <p>Customize and generate your HTML files easily</p>
      </header>

      {/* Main Content */}
      <div className="container mt-3">
        <form onSubmit={handleFormSubmit}>
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
                  required
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
            <div className="col-md-6">
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
          <div className="d-flex justify-content-end">
            <div className="me-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearAll}
            >
              Clear
            </button></div>
            <div className="me-2">
            <button type="submit" className="btn btn-primary">
              Generate HTML
            </button></div>
          </div>
        </form>
      </div>

      {/* Footer */}
      {/* <footer className="bg-dark text-white text-center py-3 mt-5">
        <p>
          &copy; {new Date().getFullYear()} HTML Generator Tool. All rights reserved.
        </p>
      </footer> */}
    </>
  );
}

export default App;
