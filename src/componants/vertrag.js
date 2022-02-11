import React, { Component } from "react";
import './gesichtEin.css';
import { Container, Row, Col, Alert, Button } from 'reactstrap';
import http from './http-axios';
import EditorContainer from './vertragEditor'
import vertragSprche from '../sprache/vertragSprche'


class Vertrag extends Component {
    constructor () {
        super ();
        this.state = {
            shwoContrctDetail: false,
            contractTitle: null,
            serialNumer: null,
            publicity: false,
            createdTime: null,
            anwendung: null,
            occupationnumer: null,
            vertragstatus: null,
            updateTag: null,
            updatenZeit: null,
            
            mainParty: null,
            einNumer: null,
            zweiteParty: null,
            zeitNumer: null,
            searchSecondParty: null, //search for second party
            secondparyArray: [], //if there are more than one second party from database

            //swtich modification mode
            contractModifyMode: "empty", 
            updatemessage: null,

            //infor including stifung, create time
            abkommen: [],
            inhaltabkommen: [],
            occupationconfirmation: [],
            abkommenupdaten: [],
            initialContract: null,

            //alert
            showalert: false,
            alertmessage: null,

            toggletitle: false,
            toggleproject: false,
            toggleattorney: false,

            sprachsetting: 0
        }
        this.pointSecondParty = this.pointSecondParty.bind(this) //point second party
        this.generateInvitationCode = this.generateInvitationCode.bind(this)
        this.erstellen = this.erstellen.bind(this) //generate contract o back
        this.negotiate = this.negotiate.bind(this) //negotiating contract content
        this.ratification = this.ratification.bind(this) //agree the contract
        this.löschen = this.löschen.bind(this) //delete contract
        this.certify = this.certify.bind(this)
    }
    componentDidMount () {
        localStorage.removeItem('content')
        const zertifikat = {"token": localStorage.getItem('token')}
        http.post("/api/post", zertifikat).then((res) => {
            if (res.data.status === 'login' || res.data.status === "invitationCodeRequest") { 
                //log-in success
                http.post("/getlanguage", {"user": localStorage.getItem('user')}).then(res => {
                    if (res.data.status === "success") {
                        this.setState({ sprachsetting: res.data.sprache })
                    } 
                })
                //try to get vertrag data by url
                const kontoInfor = {"user": localStorage.getItem('user')}
                http.post(`/vertrag/jedes/id=${this.props.match.params.vertragnumer}`, kontoInfor).then((res) => {
                    //if get from back is not empty, load the contract
                    //else load default
                    if (res.data.status !== "fail") {
                        //if no system fail
                        this.setState({
                            alertmessage: null,
                            showalert: false,
                        })
                        switch(res.data.status) {
                            case "empty":
                                //empty contract
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    contractModifyMode: "empty", //turn on modifiy mode
                                })
                                break
                            case "created":
                                //same account review contract
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    contractModifyMode: "created", //turn on modifiy mode
                                })
                                break
                            case "reviewing":
                                //currently second party review
                                //load both parties infor
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "reviewing", //turn on modifiy mode
                                })
                                break
                            case "negotiation":
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "negotiation", //turn on modifiy mode
                                })
                                break
                            case "ratified":
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "ratified", //turn on modifiy mode
                                })
                                break
                            case "abolished":
                                this.setState({ 
                                    mainParty: res.data.erstekonto[0].konto,
                                    inNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "abolished", //turn on modifiy mode
                                })
                                break
                            case "attorney":
                                this.setState({
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "attorney", //turn off modifiy mode, 
                                    occupationnumer: res.data.occupationnumer
                                })
                                break
                            case "anonymous":
                                this.setState({
                                    mainParty: res.data.erstekonto[0].konto,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer,
                                    contractModifyMode: "anonymous", 
                                })
                                break
                        }
                        //load contract content
                        this.setState({ abkommen: res.data.abkommen, inhaltabkommen: res.data.inhaltabkommen })
                        if (res.data.abkommen.length > 0) {
                            this.setState({
                                contractTitle: this.state.abkommen[0].titel,
                                serialNumer: this.state.abkommen[0].abkommennumer,
                                publicity: this.state.abkommen[0].publicity,
                                createdTime: this.state.abkommen[0].creatzeit,
                                anwendung: this.state.abkommen[0].anwendung,
                                vertragstatus: this.state.abkommen[0].vertragstatus
                            })
                        }
                        if (res.data.inhaltabkommen.length > 0) {
                            window.localStorage.setItem('content', JSON.stringify(res.data.inhaltabkommen[0].sprach))
                            this.setState({ initialContract: res.data.inhaltabkommen[0].sprach })
                        } 
                        if (res.data.occupationconfirmation.length > 0 ) {
                            this.setState({ occupationconfirmation: res.data.occupationconfirmation })
                        } 
                        if (res.data.abkommenupdaten.length > 0) {
                            this.setState({ abkommenupdaten: res.data.abkommenupdaten })
                            if (this.state.abkommenupdaten.length > 0 ) {
                                this.setState({ 
                                    updatenZeit: this.state.abkommenupdaten[0].updatenzeit,
                                    updateTag: this.state.abkommenupdaten[0].updatetag,
                                })
                            }
                        }
                    } else {
                        this.setState({ showalert: true, alertmessage: res.data.err })
                    }
                })
            } else {
                //else if (res.data.status === '400' || res.data.status === '401')
                //token expire
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                //jump to front
                http.get(`/vertrag/null/id=${this.props.match.params.vertragnumer}`).then((res) => {
                    switch(res.data.status) {
                        case "anonymous":
                            this.setState({
                                mainParty: res.data.erstekonto[0].konto,
                                einNumer: res.data.erstekonto[0].kontonumer,
                                zweiteParty: res.data.zweitekonto[0].konto,
                                zeitNumer: res.data.zweitekonto[0].kontonumer,
                                contractModifyMode: "anonymous", 
                            })
                            break
                        case "invitationCodeRequest":
                            this.setState({
                                mainParty: res.data.erstekonto[0].konto,
                                einNumer: res.data.erstekonto[0].kontonumer,
                                zweiteParty: "invitationCodeRequest",
                                zeitNumer: res.data.invitationCode,
                                contractModifyMode: "reviewing", 
                            })
                            break
                        }
                    this.setState({ abkommen: res.data.abkommen, inhaltabkommen: res.data.inhaltabkommen })
                    if (res.data.abkommen.length > 0) {
                        this.setState({
                            contractTitle: this.state.abkommen[0].titel,
                            serialNumer: this.state.abkommen[0].abkommennumer,
                            publicity: this.state.abkommen[0].publicity,
                            createdTime: this.state.abkommen[0].creatzeit,
                            anwendung: this.state.abkommen[0].anwendung,
                            vertragstatus: this.state.abkommen[0].vertragstatus
                        })
                    }
                    if (res.data.inhaltabkommen.length > 0) {
                        this.setState({ initialContract: res.data.inhaltabkommen[0].sprach })
                    } 
                    if (res.data.occupationconfirmation.length > 0 ) {
                        this.setState({ occupationconfirmation: res.data.occupationconfirmation })
                    } 
                    if (res.data.abkommenupdaten.length > 0) {
                        this.setState({ abkommenupdaten: res.data.abkommenupdaten })
                        if (this.state.abkommenupdaten.length > 0 ) {
                            this.setState({ 
                                updatenZeit: this.state.abkommenupdaten[0].updatenzeit,
                                updateTag: this.state.abkommenupdaten[0].updatetag,
                            })
                        }
                    }
                })
            }
        })
    }
    pointSecondParty () {
        if (this.state.searchSecondParty != null) {
            http.post('/searchSeondParty', {"secondparty": this.state.searchSecondParty}).then((res) => {
                switch (res.data.status) {
                    //case "Found":
                        //this.setState({ zweiteParty: res.data.zweitekonto[0].konto, zeitNumer: res.data.zweitekonto[0].kontonumer })
                        //break
                    case "Choose":
                        this.setState({ secondparyArray: res.data.zweitekonto })
                        break
                    case "no second party": 
                    this.setState({ zweiteParty: "No Found" })
                        break
                }
            })
        }
    }
    generateInvitationCode () {
        if (window.confirm(`Second party can be anonymous and Invitation Code is auto generated everytime load this page, agree proceed?`)) {
            this.setState({ zweiteParty: "invitationCodeRequest", zeitNumer: "invitationCodeRequest" })
        }
    }
    erstellen() {
        //generate contract to back
        //set alert fort several security
        if (this.state.mainParty === this.state.zweiteParty) {
            this.setState({
                showalert: true,
                alertmessage: "Two parties are the same !!"
            })
        } else {
            //turn off alart
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //store all data to back
            //get date
            let vertragInfor = {
                "abkommen": {
                    "vorherig": "Genesis",
                    "creator": localStorage.getItem('user'),
                    "erstekonto": this.state.einNumer,
                    "zweitekonto": this.state.zeitNumer,
                    "publicity": this.state.publicity,
                    "titel": this.state.contractTitle
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": this.state.einNumer
                },
                "occupationnumer": this.state.occupationnumer,
            }
            http.post('/hizufugenVertrag', vertragInfor).then(res => {
                //return if system fail
                if (res.data.status === 'fail') {
                    this.setState({
                        showalert: true,
                        alertmessage: "Error: " + res.data.error
                    })
                } else {
                    //create contract success, return to main page
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                }
            })
        }
    }
    negotiate () {
        //ready update
        //turn off alart
        this.setState({
            showalert: false,
            alertmessage: null
        })
        if (this.state.zweiteParty === "invitationCodeRequest") {
            alert(`Please remember Invitation Code ${this.state.zeitNumer}`)
        }
        let update = {}
        if (this.state.abkommen[0].vertragstatus === "created" && this.state.mainParty === localStorage.getItem('user') && this.state.zweiteParty === null) {
            //still the orginal party
            update = {
                "abkommen": {
                    "abkommennumer": this.state.abkommen[0].abkommennumer,
                    "vertragstatus": this.state.abkommen[0].vertragstatus,
                    "titel": this.state.contractTitle,
                    "publicity": this.state.publicity,
                    "anwendung": this.state.anwendung
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": localStorage.getItem('user')
                },
                "occupationnumer": this.state.occupationnumer,
                "status": "created"
            }
        } else if ((this.state.abkommen[0].vertragstatus === "created" && this.state.mainParty === localStorage.getItem('user') && this.state.zweiteParty !== null)
            || (this.state.abkommen[0].vertragstatus === "reviewing" && this.state.zweiteParty === localStorage.getItem('user'))) {
            //first time second party join
            update = {
                "abkommen": {
                    "vorherig": this.state.inhaltabkommen[0].abkommennumer,
                    "creator": localStorage.getItem('user'),
                    "erstekonto": this.state.einNumer,
                    "zweitekonto": this.state.zeitNumer,
                    "vertragstatus": "negotiation",
                    "titel": this.state.contractTitle,
                    "publicity": this.state.publicity,
                    "anwendung": this.state.anwendung
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": localStorage.getItem('user')
                },
                "occupationnumer": this.state.occupationnumer,
                "status": "joining"
            }
        } else if (this.state.contractModifyMode === "reviewing" && this.state.zweiteParty === "invitationCodeRequest") {
            //anonymous
            update = {
                "abkommen": {
                    "vorherig": this.state.inhaltabkommen[0].abkommennumer,
                    "creator": "invitationCodeRequest",
                    "erstekonto": this.state.einNumer,
                    "zweitekonto": this.state.zeitNumer,
                    "vertragstatus": "negotiation",
                    "titel": this.state.contractTitle,
                    "publicity": this.state.publicity,
                    "anwendung": this.state.anwendung
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": this.state.zeitNumer
                },
                "occupationnumer": this.state.occupationnumer,
                "status": "invitationCodeRequest"
            }
        } else if (this.state.abkommen[0].vertragstatus === "negotiation" || this.state.abkommen[0].vertragstatus.includes("Consent") === true) {
            //two parties are negotiating
            update = {
                "abkommen": {
                    "abkommennumer": this.state.abkommen[0].abkommennumer,
                    "vertragstatus": "negotiation",
                    "titel": this.state.contractTitle,
                    "publicity": this.state.publicity,
                    "anwendung": this.state.anwendung
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": localStorage.getItem('user')
                },
                "occupationnumer": this.state.occupationnumer,
                "status": "negotiation"
            }
        } else {
            this.setState({ 
                showalert: true,
                alertmessage: "There is some system mistake, update fail!"
            })
        }
        http.post('/updatenVertrag', update).then(res => {
            //return if system fail
            if (res.data.status === 'fail') {
                this.setState({
                    showalert: true,
                    alertmessage: "Error: " + res.data.error
                })
            } else if (res.data.status === "invitationCodeRequest") {
                let abkommennumer = res.data.abkommennumer
                http.post("/anmeldung", [{"user": this.state.zeitNumer, "status": "invitationCodeRequest"}]).then((res) => {
                    if (res.data.status === 'fail') {
                        this.setState({ 
                            showalert: true,
                            alertmessage: "There is some system mistake, reload account information fail!"
                        })
                    } else {
                        localStorage.setItem('token', res.data.token)
                        localStorage.setItem('user', res.data.user)
                        window.location = `/vertrag/jedes/id=${abkommennumer}`
                    }
                })
            } else {
                if (localStorage.getItem('user') !== null) {
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                } else {window.localStorage = "/hauptsachlich"}
            }
        })
    }
    ratification () {
        //agree the contract
        let ratifyContract = {}
        if (this.state.abkommen[0].vertragstatus === "negotiation") {
            ratifyContract = {
                "abkommen": {
                    "abkommennumer": this.state.abkommen[0].abkommennumer,
                    "vertragstatus": `${localStorage.getItem('user')} Consent`,
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": localStorage.getItem('user')
                },
                "status": "singleconsent"
            }
        } else if (this.state.abkommen[0].vertragstatus.includes("Consent") === true) {
            ratifyContract = {
                "abkommen": {
                    "abkommennumer": this.state.abkommen[0].abkommennumer,
                    "vertragstatus": "ratified",
                },
                "inhaltabkommen": {
                    "sprach": localStorage.getItem('content'),
                },
                "abkommenupdaten": {
                    "updatenby": localStorage.getItem('user')
                },
                "status": "ratified"
            }
        }else {this.setState({ 
            showalert: true,
            alertmessage: "There is some system mistake, consent fail!"
        })}
        http.post('/ratifyContract', ratifyContract).then(res => {
            //return if system fail
            if (res.data.status === 'fail') {
                this.setState({
                    showalert: true,
                    alertmessage: "Error: " + res.data.error
                })
            } else {
                if (localStorage.getItem('user') !== null) {
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                } else {window.localStorage = "/hauptsachlich"}
            }
        })
    }
    löschen () {
        alert("Notice !! Once you delete, there is no chance to recover data back, system will erase all the data regarding this contract!!!")
        if (window.confirm(`Are you sure you want to Delete the Contract ${this.props.match.params.vertragnumer}?`)) {
            let löschen = {
                "abkommen": {"abkommennumer": this.state.abkommen[0].abkommennumer, "vertragstatus": "abolish"},
                "party": localStorage.getItem('user'),
                "status": "abolish"
            }
            http.post('/abolish', löschen).then(res => {
                //return if system fail
                if (res.data.status === 'fail') {
                    this.setState({
                        showalert: true,
                        alertmessage: "Error: " + res.data.error
                    })
                } else {
                    //create contract success, return to main page
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                }
            })
        }
    }
    certify () {
        let certify = {
            "abkommennumer": this.state.abkommen[0].abkommennumer,
            "occupationnumer": this.state.occupationnumer,
            "witnesssign": localStorage.getItem('user')
        }
        http.post('/certify', certify).then(res => {
            //return if system fail
            if (res.data.status === 'fail') {
                this.setState({
                    showalert: true,
                    alertmessage: "Error: " + res.data.error
                })
            } else {
                //create contract success, return to main page
                window.location = `/mitglied/id=${localStorage.getItem('user')}`
            }
        })
    }
    render () {
        let jedesZweitePartei = this.state.secondparyArray.map( s => {
            return (<Button outline color="link" size="sm" onClick={() => {
                this.setState({ zweiteParty: s.konto, zeitNumer: s.kontonumer, secondparyArray: [] })
            }}>{s.konto}</Button>)
        })
        let certification = this.state.occupationconfirmation.map( c => {
            if (this.state.occupationconfirmation.length > 0) {
            return(
            <div className="text-left-gap text-pointer" onClick={() => {window.location = `/mitglieduberprufung/id=${c.occupationnumer}`}}>
                {c.occupationnumer}</div>)
                }
        })
        return (
            <Container>
            {this.state.showalert === true &&
            <div>
                <br />
                <Alert color="warning">{this.state.alertmessage}</Alert>
            </div>}
            <div className="text-pointer" onClick={() => {this.setState({ shwoContrctDetail: !this.state.shwoContrctDetail })}}>
                {this.state.shwoContrctDetail === false && <div> → [開] {vertragSprche[this.state.sprachsetting].zeigenDetail}</div>}
                {this.state.shwoContrctDetail === true && <div> ← [關] {vertragSprche[this.state.sprachsetting].versteckenDetail}</div>}
            </div>
            {this.state.shwoContrctDetail === true && <div>
                <br />
                <div className="making-row separate-two-side">
                    <div className="block-ersten-infor">
                        <div className="block-ersten-infor-container">
                            <br />
                            {this.state.mainParty !== null && this.state.contractModifyMode !== "reviewing" &&
                            <div className="text-trademakr-infor text-contract-party-height">{vertragSprche[this.state.sprachsetting].vertragErfolgt} {this.state.mainParty} {this.state.zweiteParty !== null && this.state.zweiteParty !== "invitationCodeRequest" && <div>{vertragSprche[this.state.sprachsetting].und} {this.state.zweiteParty}</div>}</div>}
                            {this.state.mainParty !== null && this.state.contractModifyMode === "reviewing" && 
                            <div className="text-trademakr-infor text-contract-party-height">{vertragSprche[this.state.sprachsetting].vertragErfolgtMit} {this.state.mainParty}</div>}
                            {this.state.zweiteParty === null &&
                            this.state.contractModifyMode !== "anonymous" && 
                            this.state.contractModifyMode !== "ratified" && 
                            this.state.contractModifyMode !== "attorney" && 
                            <div className="making-row">
                                <input type="text" placeholder="Add second party name" className='input-contract-detail'
                                    onChange={(e) => {this.setState({ searchSecondParty: e.target.value })}}/>
                                <button className="toggle" onClick={() => {this.pointSecondParty()}}>{vertragSprche[this.state.sprachsetting].suche}</button>
                                {(this.state.contractModifyMode === "empty" || this.state.contractModifyMode === "created") && this.state.zweiteParty === null &&
                                <button className="toggle" onClick={() => {this.generateInvitationCode()}}>{vertragSprche[this.state.sprachsetting].einladungscode}</button>}
                            </div>}
                            {this.state.secondparyArray.length > 0 && <Row><Col>{jedesZweitePartei}</Col></Row>}
                            {this.state.zweiteParty === "No Found" && <Row><Col>Find no Result</Col></Row>}
                            {(this.state.contractModifyMode === "empty" || this.state.contractModifyMode === "created") && this.state.zweiteParty === "invitationCodeRequest" &&
                            <div className="text-trademakr-infor text-pointer" 
                                onClick={() => {
                                    if (window.confirm(`${vertragSprche[this.state.sprachsetting].alertEinladungscodeEinzeugen}`)) {
                                    this.setState({ zweiteParty: null, zeitNumer: null })}
                                    }}>
                                    {vertragSprche[this.state.sprachsetting].bestätigenEinladungscodeEinzeugen}</div>}
                            {(this.state.contractModifyMode === "negotiation" || this.state.contractModifyMode === "reviewing") && this.state.zweiteParty === "invitationCodeRequest" &&
                            <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].einladungscode}: {this.state.zeitNumer}</div>}
                            <hr />
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].serieNumer}:</div>
                                <div className="text-left-gap">{this.state.serialNumer}</div>
                            </div>
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].schaffenZeit}:</div>
                                <div className="text-left-gap">{this.state.createdTime}</div> 
                            </div>
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].aktuellZeit}:</div>
                                <div className="text-left-gap">{this.state.vertragstatus}</div> 
                            </div>
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].LetzteUpdaten}:</div>
                                {this.state.updatenZeit !== null && <div className="text-left-gap">{this.state.updateTag} at {this.state.updatenZeit}</div> }
                            </div>
                        </div>
                    </div>
                    <div className="block-zweiten-infor">
                        <div className="block-zweiten-infor-container">
                            <br />
                            {(this.state.contractModifyMode === "anonymous" || 
                            this.state.contractModifyMode === "ratified" || 
                            this.state.contractModifyMode === "attorney") && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].vertragName}: </div>
                                <div className="text-left-gap">{this.state.contractTitle}</div>
                            </div>}
                            {this.state.contractModifyMode !== "anonymous" && 
                            this.state.contractModifyMode !== "ratified" && 
                            this.state.contractModifyMode !== "attorney" && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].vertragName}: </div>
                                {this.state.contractTitle === null && this.state.toggletitle === false &&
                                <div className="text-left-gap text-pointer" onClick={() => {this.setState({ toggletitle: true })}}>{vertragSprche[this.state.sprachsetting].hinzufügenVertragName}</div>}
                                {this.state.toggletitle === false &&
                                <div className="text-left-gap text-pointer" onClick={() => {this.setState({ toggletitle: true })}}>{this.state.contractTitle}</div>}
                                {this.state.toggletitle === true && 
                                <div className="making-row">
                                    <input type="text" className='input-contract-detail' placeholder={this.state.contractTitle}
                                    onChange={(e) => {this.setState({ contractTitle: e.target.value, updatemessage: `${vertragSprche[this.state.sprachsetting].updateAlert}` })}}/>
                                    <div className="text-left-gap">
                                        <button className="toggle" onClick={() => {this.setState({ toggletitle: false })}}>{vertragSprche[this.state.sprachsetting].ändern}</button>
                                    </div>
                                </div>}
                            </div>}
                            {(this.state.contractModifyMode === "anonymous" || 
                            this.state.contractModifyMode === "ratified" || 
                            this.state.contractModifyMode === "attorney") && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].status}: </div>
                                {this.state.publicity === false && <div className="text-left-gap">{vertragSprche[this.state.sprachsetting].private}</div>}
                                {this.state.publicity === true && <div className="text-left-gap" >{vertragSprche[this.state.sprachsetting].public}</div>}
                            </div>}
                            {this.state.contractModifyMode !== "anonymous" && 
                            this.state.contractModifyMode !== "ratified" && 
                            this.state.contractModifyMode !== "attorney" && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].status}: </div>
                                {this.state.publicity === false && 
                                    <div className="text-left-gap text-pointer" onClick={() => {
                                        if (window.confirm(`${vertragSprche[this.state.sprachsetting].privateAlert}`)) {
                                            this.setState({ publicity: !this.state.publicity, updatemessage: `${vertragSprche[this.state.sprachsetting].updateAlert}` })}
                                            }}>{vertragSprche[this.state.sprachsetting].private}</div>}
                                {this.state.publicity === true && 
                                    <div className="text-left-gap text-pointer" onClick={() => {
                                        if (window.confirm(`${vertragSprche[this.state.sprachsetting].publicAlert}`)) {
                                            this.setState({ publicity: !this.state.publicity, updatemessage: `${vertragSprche[this.state.sprachsetting].updateAlert}` })}
                                            }}>{vertragSprche[this.state.sprachsetting].public}</div>}
                            </div>}
                            {(this.state.contractModifyMode === "anonymous" || 
                            this.state.contractModifyMode === "ratified" || 
                            this.state.contractModifyMode === "attorney") && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].projekt}:</div>
                                {this.state.anwendung === null && <div className="text-left-gap">{vertragSprche[this.state.sprachsetting].keinProjekt}</div>}
                                <div className="text-left-gap">{this.state.anwendung}</div>
                            </div>}
                            {this.state.contractModifyMode !== "anonymous" && 
                            this.state.contractModifyMode !== "ratified" && 
                            this.state.contractModifyMode !== "attorney" && 
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor">{vertragSprche[this.state.sprachsetting].projekt}:</div>
                                {this.state.anwendung === null && this.state.toggleproject === false &&
                                <div className="text-left-gap text-pointer" onClick={() => {this.setState({ toggleproject: true })}}>{vertragSprche[this.state.sprachsetting].verbindenProjekt}</div>}
                                {this.state.toggleproject === false &&
                                <div className="text-left-gap text-pointer" onClick={() => {this.setState({ toggleproject: true })}}>{this.state.anwendung}</div>}
                                {this.state.toggleproject === true && 
                                <div className="making-row">
                                    <input type="text" className='input-contract-detail text-left-gap' placeholder={vertragSprche[this.state.sprachsetting].enterProjektNumer}
                                    onChange={(e) => {this.setState({ anwendung: e.target.value, updatemessage: `${vertragSprche[this.state.sprachsetting].updateAlert}` })}}/>
                                    <div className="text-left-gap">
                                        <button className="toggle" onClick={() => {this.setState({ toggleproject: false })}}>{vertragSprche[this.state.sprachsetting].hinzufugen}</button>
                                    </div>
                                </div>}
                            </div>}
                            <div className="making-row text-row-height">
                                <div className="text-trademakr-infor text-pointer">{vertragSprche[this.state.sprachsetting].dreitePartei}:</div>
                                {this.state.occupationconfirmation.length === 0 &&<div className="text-left-gap">{vertragSprche[this.state.sprachsetting].keineDreitePartei}</div>}
                                <div className="making-row">{certification}</div>
                                {this.state.contractModifyMode !== "anonymous" && 
                                this.state.contractModifyMode !== "attorney" && 
                                <div className="text-left-gap"><button className="toggle" onClick={() => {this.setState({ toggleattorney: !this.state.toggleattorney })}}>{vertragSprche[this.state.sprachsetting].point}</button></div>}
                            </div>
                            {this.state.toggleattorney === true && <div>
                                <input type="text" className='input-contract-detail' placeholder={vertragSprche[this.state.sprachsetting].enterOccupationNumer}
                                onChange={(e) => {this.setState({ occupationnumer: e.target.value, updatemessage: `${vertragSprche[this.state.sprachsetting].updateAlert}` })}}/>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>}
            <br />
            <Row>
                {this.state.initialContract === null && <div>Loading Contract fail</div>}
                {this.state.initialContract !== null && <div className="contract-general">
                    <EditorContainer content={this.state.initialContract} contractModifyMode={this.state.contractModifyMode}/>
                </div>} 
                <hr />
                <div className="making-row">
                    {this.state.contractModifyMode === "empty" &&
                    <button className="default" onClick={() => {this.erstellen()}}>{vertragSprche[this.state.sprachsetting].hinzufugenVertrag}</button>} 
                    {this.state.contractModifyMode === "reviewing" &&
                    <button className="update" onClick={() => {this.negotiate()}}>{vertragSprche[this.state.sprachsetting].sendVertrag}</button>}
                    {(this.state.contractModifyMode === "created" || this.state.contractModifyMode === "negotiation") &&
                    <button className="update" onClick={() => {this.negotiate()}}>{vertragSprche[this.state.sprachsetting].updatenVertrag}</button>}
                    {this.state.contractModifyMode === "negotiation" &&
                    <button className="default" onClick={() => {this.ratification()}}>{vertragSprche[this.state.sprachsetting].consentVertrag}</button>}
                    {(this.state.contractModifyMode === "created" || this.state.contractModifyMode === "negotiation" || this.state.contractModifyMode === "ratified" || this.state.contractModifyMode === "abolished") &&
                    <button className="delete" onClick={() => {this.löschen()}}>{vertragSprche[this.state.sprachsetting].deleteVertrag}</button>}
                    {this.state.contractModifyMode === "attorney" &&
                    <button className="default" onClick={() => {this.certify()}}>{vertragSprche[this.state.sprachsetting].certifyVertrag}</button>}
                </div>
                {(this.state.contractModifyMode === "attorney" || this.state.contractModifyMode === "ratified") && <div className="text-row-height">{this.state.updatemessage}</div>}
            </Row>
            </Container>
        )
    }
}

export default Vertrag;
