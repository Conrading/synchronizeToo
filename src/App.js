import React, { Component } from 'react'
import './App.css';
import { Container } from 'reactstrap'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import http from './componants/http-axios'
import Anmeldung from './componants/anmeldung'
import Hauptsächlich from './componants/hauptsachlich'
import Abändern from './componants/abändern'
import HauptsachlichEdit from './componants/hauptsachlichEdit'
import Mitglied from './componants/mitglied'
import MitgliedEdit from './componants/mitgliedEdit'
import Überprüfung from './componants/mitglieduberprufung'
import Vertrag from './componants/vertrag'
import Hauptspeople from './componants/hauptspeople'
import Main from './componants/mainPage'

class Mainframe extends Component {
  constructor () {
    super ();
    this.state = {
      logStauts: "LogIn",
    }
  }
  componentDidMount () {
    //check whether it is log-in
    //get token certificate
    //get token from localstorage
    //but couldn't confirm token expire
    const zertifikat = {"token": localStorage.getItem('token')}
    http.post("/api/post", zertifikat).then((res) => {
        //verify whether token is accept
        if (res.data.status === 'login') { 
          this.setState({ logStauts: "@" })
        } else if (res.data.status === "invitationCodeRequest") {
          this.setState({ logStauts: "II" })
        } else if (res.data.status === '400' || res.data.status === '401') {
            //token expire
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        } else {
          //token expire
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
    })
  }
  render () {
    return (
      <Router>
      <Container>
        <div className="making-row separate-two-side">
          <div className="title text text-pointer" onClick={() => {window.location = `/`}}>Chainmatic | 鏈 鎖 機 制</div>
          <div className="making-row">
            {/*<div className="width-option"><Link to={'/peoplesearch'} style={{ textDecoration: 'none' }}><div className="text">#</div></Link></div>*/}
            <div className="width-option text-pointer text" onClick={() => {window.location = '/hauptsachlich'}}>門</div>
            <div className="width-option text-pointer text" onClick={() => {window.location = '/peoplesearch'}}>##</div>
            {this.state.logStauts === "LogIn" && <div className="width-option text-pointer text" onClick={() => {window.location = '/anmeldung'}}>{this.state.logStauts}</div>}
            {(this.state.logStauts === "@" || this.state.logStauts === "II") && <div className="width-option text-pointer text" onClick={() => {window.location = `/mitglied/id=${localStorage.getItem('user')}`}}>{this.state.logStauts}</div>}
          </div>
        </div>
        <hr />
        <Switch>
          <Route exact path='/anmeldung' component={Anmeldung}/> {/*component={props => (<Anmeldung {...props} sprache={this.state.sprache}/>)}*/}
          <Route exact path='/' component={Main}/>
          <Route exact path='/hauptsachlich' component={Hauptsächlich} />
          <Route exact path='/hauptsachlich/id=:aussortierenData' component={Abändern} />
          <Route exact path='/addData/id=:kontoname' component={HauptsachlichEdit} />
          <Route exact path='/editData/project=:projectnumer' component={HauptsachlichEdit} />
          <Route exact path='/peoplesearch' component={Hauptspeople} />
          <Route exact path='/mitglied/id=:kontoname' component={Mitglied} />
          <Route exact path='/mitgliedinformation/id=:kontoname' component={MitgliedEdit} />
          <Route exact path='/mitglieduberprufung/id=:occupationnumer' component={Überprüfung} />
          <Route exact path='/vertrag/jedes/id=:vertragnumer' component={Vertrag} />
        </Switch>
        <br />
        <br />
        <div className="center-text">
          <div>@2021 Chainmatic | 鏈 鎖 機 制, All Rights Reserved</div>
        </div>
        {/* 
        <div className="making-row separate-two-side">
          <div>@2021 Chainmatic | 鏈 鎖 機 制, All Rights Reserved</div>
          <select value={this.state.sprache} onChange={(e) => {
            this.setState({ sprache: e.target.value })
            this.languageSwitch(e)}}>
              <option value="">---</option>
              <option value={0}>English</option>
              <option value={1}>繁體</option>
              <option value={2}>Polski</option>
          </select>
          </div>*/}
      </Container>
      </Router>
    )
  }
}

export default Mainframe;
