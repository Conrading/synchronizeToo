import React, { Component } from "react";
import './gesichtEin.css'
import { Container } from 'reactstrap'
import http from './http-axios'
import anmeldungSprach from "../sprache/anmeldungSprach"


class Anmeldung extends Component {
    constructor () {
        super ();
        this.state = {
            userInput: null,
            codeInput: null,
            passwordfail: null, // showing log-in status

            showInvitationCode: false,
            invitationCode: null,
            sprachsetting: 0,
        }
        this.anmelden = this.anmelden.bind(this)
    }
    anmelden () {
        //send password to back
        const konto = [{ 
            "user": this.state.userInput,
            "password": this.state.codeInput 
        }]
        if (this.state.userInput !== null && this.state.codeInput !== null) {
            http.post("/anmeldung", konto).then((res) => {
                if (res.data.status === 'fail') {
                    this.setState({ passwordfail: "sorry, incorrect user name or password" })
                } else {
                    //store token in localstorage
                    localStorage.setItem('token', res.data.token)
                    localStorage.setItem('user', res.data.user)
                    //jump to correct page
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                }
            })
        } else if (this.state.invitationCode !== null) {
            const invitaiton = [{
                "user": this.state.invitationCode.toLowerCase(), 
                "status": "invitationCodeRequest"
            }]
            http.post("/anmeldung", invitaiton).then((res) => {
                if (res.data.status === 'fail') {
                    this.setState({ passwordfail: "sorry, invitation code does not exist" })
                } else {
                    //store token in localstorage
                    localStorage.setItem('token', res.data.token)
                    localStorage.setItem('user', res.data.user)
                    //jump to correct page
                    window.location = `/vertrag/jedes/id=${res.data.abkommennumer}`
                }
            })
        } else if (this.state.userInput !== null && this.state.codeInput !== null && this.state.invitationCode !== null) {
            this.setState({ 
                passwordfail: "You can't login with your account and invitation code at same time",
                userInput: null,
                codeInput: null,
                invitationCode: null
            })
        }
        /*
        if (this.state.codeInput === "in-my-life") {
            window.location = `/hauptsachlich`
        } else {alert("try another password")}
        */
    }
    render () {
        return (
            <Container>
                <br />
                <div className="block-anmeldung">
                    <div className="center-text logo-anmeldung gap-upper">
                        <div className="text-anmeldung-title">Chainmatic</div>
                        <div className="text-anmeldung-title">鏈 鎖 機 制</div>
                    </div>
                    <div className="center-text">
                        <input type="text" placeholder={anmeldungSprach[this.state.sprachsetting].UserName} className="input-anmeldung" onChange={(e) => {this.setState({ userInput: e.target.value })}}/>
                        <input type="password" placeholder={anmeldungSprach[this.state.sprachsetting].password} className="input-anmeldung gap-upper" onChange={(e) => {this.setState({ codeInput: e.target.value })}}/>
                    </div>
                    <div className="gap-upper center-text">
                        <div className="center-text making-row">
                            <div className="width-control-drei gap-both-siebzehn"><hr /></div>
                            <div className="text-trademakr-infor gap-both-siebzehn">or</div>
                            <div className="width-control-drei gap-both-siebzehn"><hr /></div>
                        </div>
                        {this.state.showInvitationCode === false &&<div className="text-pointer" onClick={() => {this.setState({ showInvitationCode: true })}}>{anmeldungSprach[this.state.sprachsetting].invitationCode}</div>}
                        {this.state.showInvitationCode === true &&<div>
                            <input type="password" className="input-second-party" onChange={(e) => {this.setState({ invitationCode: e.target.value })}}/>
                        </div>}
                    </div>
                    <div className="center-text gap-upper ">
                        <button className="anmeldung" onClick={() => this.anmelden()}>{anmeldungSprach[this.state.sprachsetting].login}</button>
                    </div>
                </div>
                <br />
                <div className="center-text">{this.state.passwordfail}</div>
            </Container>
        )
    }
}

export default Anmeldung;
