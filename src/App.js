import React, { Component } from "react";
import './App.css';

class Lebenslauf extends Component {
  constructor (props) {
    super (props);
    this.state = {}
  }
  render () {
    return (
      <body>
        <Document>
        <br />
        <div className="center-object">
          <div className="erste-row-scale">
            <img src="/01.jpg" />
            <div className="erste-rwo-left0side-grid">
              <div className="main-name">Conrad Lin</div>
              <div className="basic-infor-frame">
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">Passport Name:</div>
                  <div className="basic-infor-frame-zweite-text"> Lin Yang-Yu</div>  
                </div>
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">Email:</div>
                  <div className="basic-infor-frame-zweite-text">sichangyozu@gmail.com</div>  
                </div>
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">Phone:</div>
                  <div className="basic-infor-frame-zweite-text">+48 662 659 172</div>  
                </div>
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">Address:</div>
                  <div className="basic-infor-frame-zweite-text">Czysta 2/5B 50-013 Wroclaw Poland</div>  
                </div>
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">LinkedIn:</div>
                  <div className="basic-infor-frame-zweite-text text-pointer" onClick={() => {window.location.href = 'https://www.linkedin.com/in/yang-yu-lin/'}}>https://www.linkedin.com/in/yang-yu-lin/</div>  
                </div>
                <div className="making-row">
                  <div className="basic-infor-frame-erste-text">Website:</div>
                  <div className="basic-infor-frame-zweite-text text-pointer" onClick={() => {window.location.href = 'http://www.chainmatic.de'}}>http://www.chainmatic.de</div>  
                </div>
              </div>
            </div>
          </div>
          <div className="zeite-row-scale">
            <div className="title-text-frame">Objective</div>
          </div>
        </div>
        </Document>
      </body>
    )
  }
}

export default Lebenslauf;