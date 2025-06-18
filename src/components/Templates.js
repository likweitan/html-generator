import React from 'react';

function Templates() {
  return (
    <div className="container mt-4">
      <h2>Available Templates</h2>
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Template 1</h5>
              <p className="card-text">A clean, professional template suitable for general announcements and updates.</p>
              <button className="btn btn-primary">Preview Template</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Template 2</h5>
              <p className="card-text">A modern, visually appealing template perfect for marketing campaigns.</p>
              <button className="btn btn-primary">Preview Template</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Templates;