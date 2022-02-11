import React, { Component } from "react";
import './gesichtEin.css';
import { Button, Container, Row, Col, Input, Alert } from 'reactstrap';
import http from './http-axios';
import Modal from './modal';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import EditorContainer from './vertragEditor'
//import ReactPDF from '@react-pdf/renderer';


class Vertrag extends Component {
    constructor () {
        super ();
        this.state = {
            showPreambleInput: false,
            contractTitle: "Contract",
            mainParty: null,
            mainPartyuppercase: null,
            einOrt: null,
            einAnderer: null, //personal ID, corresponding to identitate
            einNumer: null, //serial number, corresponding to kontonumer
            zweiteParty: null,
            zweitePartyuppercase: null,
            zweiOrt: null,
            zweiAnderer: null, //personal ID, corresponding to identitate
            zeitNumer: null, //serial number, corresponding to kontonumer
            searchSecondParty: null, //search for second party
            secondparyArray: [], //if there are more than one second party from database

            //swtich modification mode
            contractModifyMode: "empty", 

            //infor including stifung, create time
            abkommen: [],
            inhaltabkommen: [],
            allesSprach: [], //all the language including template and non template

            //Edit contract ontent
            editingMode: false, //trigger to show
            anpassen: null, //store contract content
            saveStatus: "", // to show edting save status

            showingPDF: false,
            //alert
            showalert: false,
            alertmessage: null,
        }
        this.pointSecondParty = this.pointSecondParty.bind(this) //point second party
        this.erstellen = this.erstellen.bind(this) //generate contract o back
        this.negotiate = this.negotiate.bind(this) //negotiating contract content
        this.ratification = this.ratification.bind(this) //agree the contract
        this.löschen = this.löschen.bind(this) //delete contract
        this.laden = this.laden.bind(this) //download PDF
        this.zurücksetzen = this.zurücksetzen.bind(this) //reset all 
    }
    componentDidMount () {
        //check whether it is log-in
        //or return to log-in page
        //get token certificate
        //get token from localstorage
        //but couldn't confirm token expire
        const zertifikat = {"token": localStorage.getItem('token')}
        console.log("show the token " + JSON.stringify(zertifikat))
        http.post("/api/post", zertifikat).then((res) => {
            //verify whether token is accept
            if (res.data.status === 'login') { 
                //log-in success
                //try to get vertrag data by url
                http.get(`/vertrag/${localStorage.getItem('user')}/id=${this.props.match.params.vertragnumer}`).then((res) => {
                    //if get from back is not empty, load the contract
                    //else load default
                    if (res.data.status !== "fail") {
                        //if no system fail
                        this.setState({
                            alertmessage: null,
                            showalert: false,

                            //import first party infor
                            mainParty: res.data.erstekonto[0].konto,
                            einOrt: res.data.erstekonto[0].ort,
                            einAnderer: res.data.erstekonto[0].identitate,
                            einNumer: res.data.erstekonto[0].kontonumer,
                        })
                        this.setState({ mainPartyuppercase: this.state.mainParty.toUpperCase() })
                        switch(res.data.status) {
                            case "erste vertrag":
                                //same account review contract
                                this.setState({ 
                                    contractModifyMode: "erste vertrag", //turn on modifiy mode
                                })
                                break
                            case "zweite vertrag":
                                //currently second party review
                                //load both parties infor
                                this.setState({ 
                                    contractModifyMode: "zweite vertrag", //turn on modifiy mode
    
                                    //import second party infor
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zweiOrt: res.data.zweitekonto[0].ort,
                                    zweiAnderer: res.data.zweitekonto[0].identitate,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer
                                })
                                this.setState({ zweitePartyuppercase: this.state.zweiteParty.toUpperCase() })
                                break
                            case "ratified":
                                //currently second party review
                                //load both parties infor
                                this.setState({ 
                                    contractModifyMode: "ratified", //turn on modifiy mode
    
                                    mainParty: res.data.erstekonto[0].konto,
                                    einOrt: res.data.erstekonto[0].ort,
                                    einAnderer: res.data.erstekonto[0].identitate,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zweiOrt: res.data.zweitekonto[0].ort,
                                    zweiAnderer: res.data.zweitekonto[0].identitate,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer
                                })
                                this.setState({ zweitePartyuppercase: this.state.zweiteParty.toUpperCase() })
                                break
                            case "attorney":
                                this.setState({
                                    contractModifyMode: "attorney", //turn off modifiy mode
    
                                    mainParty: res.data.erstekonto[0].konto,
                                    einOrt: res.data.erstekonto[0].ort,
                                    einAnderer: res.data.erstekonto[0].identitate,
                                    einNumer: res.data.erstekonto[0].kontonumer,
                                    zweiteParty: res.data.zweitekonto[0].konto,
                                    zweiOrt: res.data.zweitekonto[0].ort,
                                    zweiAnderer: res.data.zweitekonto[0].identitate,
                                    zeitNumer: res.data.zweitekonto[0].kontonumer
                                })
                                this.setState({ zweitePartyuppercase: this.state.zweiteParty.toUpperCase() })
                                break
                            case "dreite person":
                                this.setState({
                                    contractModifyMode: "review", //turn off everything
                                })
                                break
                            default:
                                //empty contract
                                this.setState({ 
                                    contractModifyMode: "empty", //turn on modifiy mode
                                })
                                break
                        }
                        //load contract content
                        this.setState({ abkommen: res.data.abkommen, inhaltabkommen: res.data.inhaltabkommen })
                        if (res.data.inhaltabkommen.length > 0) {
                            this.setState({ contractTitle: res.data.abkommen[0].titel, anpassen: res.data.inhaltabkommen[0].sprach })
                            //send to Sprach to allesSparch variable
                            let bauen = this.state.anpassen.split("\n")
                            this.setState({ allesSprach: bauen })
                        }
                    } else {
                        this.setState({ showalert: true, alertmessage: res.data.err })
                    }
                })
            } else if (res.data.status === '400' || res.data.status === '401') {
                //token expire
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                //jump to front
                window.location = `/`
            } else {
                window.location = `/`
            }
        })
    }
    pointSecondParty () {
        if (this.state.searchSecondParty != null) {
            http.post('/searchSeondParty', {"secondparty": this.state.searchSecondParty}).then((res) => {
                switch (res.data.status) {
                    case "Found":
                        this.setState({
                            zweiteParty: res.data.zweitekonto[0].konto,
                            zweiOrt: res.data.zweitekonto[0].ort,
                            zweiAnderer: res.data.zweitekonto[0].identitate,
                            zeitNumer: res.data.zweitekonto[0].kontonumer
                        })
                        this.setState({ zweitePartyuppercase: this.state.zweiteParty.toUpperCase() })
                        break
                    case "Choose":
                        this.setState({ secondparyArray: res.data.zweitekonto })
                        break
                    case "no second party": 
                        break
                }
            })
        }
    }
    erstellen() {
        //generate contract to back
        //set alert fort several security
        if (this.state.anpassen === null) {
            this.setState({
                showalert: true,
                alertmessage: "Please add clause in contract"
            })
        } else if (this.state.mainParty === this.state.zweiteParty) {
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
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
    
            today = mm + '/' + dd + '/' + yyyy;
            let vertragInfor = {}
            if (this.state.zeitNumer === null) {
                //store the general infor of vertrag
                vertragInfor = {
                    "abkommen": {
                        "vorherig": "Genesis",
                        "creator": localStorage.getItem('user'),
                        "erstekonto": this.state.einNumer,
                        "creatzeit": today,
                        "titel": this.state.contractTitle,
                    },
                    "inhaltabkommen": {
                        "sprach": this.state.anpassen,
                        "updatenzeit": today,
                        "vertragstatus": "Created",
                    }
                }
            } else {
                vertragInfor = {
                    "abkommen": {
                        "vorherig": "Genesis",
                        "creator": localStorage.getItem('user'),
                        "erstekonto": this.state.einNumer,
                        "zweitekonto": this.state.zeitNumer,
                        "creatzeit": today,
                        "titel": this.state.contractTitle,
                    },
                    "inhaltabkommen": {
                        "sprach": this.state.anpassen,
                        "updatenzeit": today,
                        "vertragstatus": "Negotiating",
                    }
                }
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
        //modify contract content
        //compare at least there is some changes
        if (this.state.mainParty !== localStorage.getItem('user') && this.state.zweiteParty !== localStorage.getItem('user')) {
            //not both party 
            this.setState({
                showalert: true,
                alertmessage: "System mistake, because you are supposed to be one of the party!"
            })
        } else {
            //ready update
            //turn off alart
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //store all data to back
            //get date
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
    
            today = mm + '/' + dd + '/' + yyyy;
            let update = {}
            if (this.state.inhaltabkommen[0].vertragstatus === "Created" && this.state.zweiteParty === null) {
                //still the orginal party
                update = {
                    "abkommen": {
                        "abkommennumer": this.state.abkommen[0].abkommennumer,
                        "titel": this.state.contractTitle,
                    },
                    "inhaltabkommen": {
                        "sprach": this.state.anpassen,
                        "updatenzeit": today,
                        "vertragstatus": this.state.inhaltabkommen[0].vertragstatus,
                    },
                    "status": "only first party"
                }
            }
            if (this.state.inhaltabkommen[0].vertragstatus === "Created" && this.state.zweiteParty !== null) {
                //first time second party join
                update = {
                    "abkommen": {
                        "vorherig": this.state.inhaltabkommen[0].abkommennumer,
                        "creator": localStorage.getItem('user'),
                        "erstekonto": this.state.einNumer,
                        "zweitekonto": this.state.zeitNumer,
                        "creatzeit": today,
                        "titel": this.state.contractTitle,
                        "anwendung": this.state.abkommen[0].anwendung
                    },
                    "inhaltabkommen": {
                        "sprach": this.state.anpassen,
                        "updatenzeit": today,
                        "vertragstatus": "Negotiating",
                    },
                    "status": "second party join"
                }
            }
            if (this.state.inhaltabkommen[0].vertragstatus === "Negotiating" || this.state.inhaltabkommen[0].vertragstatus === "Single Consent") {
                //two parties are negotiating
                update = {
                    "abkommen": {
                        "abkommennumer": this.state.abkommen[0].abkommennumer,
                        "titel": this.state.contractTitle,
                    },
                    "inhaltabkommen": {
                        "sprach": this.state.anpassen,
                        "updatenzeit": today,
                        "vertragstatus": "Negotiating",
                    },
                    "status": "two parties negotiating"
                }
            }
            http.post('/updatenVertrag', update).then(res => {
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
    ratification () {
        //agree the contract
        //confirm whether contract is modified
        if (this.state.anpassen === this.state.inhaltabkommen[0].sprach) {
            //no modify
            //proceed
            let ratifyContract = {}
            if (this.state.inhaltabkommen[0].vertragstatus === "Negotiating") {
                ratifyContract = {
                    "inhaltabkommen": {
                        "abkommennumer": this.state.inhaltabkommen[0].abkommennumer,
                        "vertragstatus": "Single Consent",
                    },
                    "status": "Single Consent"
                }
            }
            if (this.state.inhaltabkommen[0].vertragstatus === "Single Consent") {
                ratifyContract = {
                    "inhaltabkommen": {
                        "abkommennumer": this.state.inhaltabkommen[0].abkommennumer,
                        "vertragstatus": "ratified",
                    },
                    "status": "ratified"
                }
            }
            http.post('/ratifyContract', ratifyContract).then(res => {
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
        } else {
            //contract is modified
            this.setState({
                showalert: true,
                alertmessage: "Have you modified contract? if you modify contract, you need to let counterparty check again"
            })
        }
    }
    löschen () {
        if (window.confirm(`Are you sure you want to Delete the Contract ${this.props.match.params.vertragnumer}?`)) {
            let löschen = {
                "abkommen": {"abkommennumer": this.state.abkommen[0].abkommennumer,},
                "inhaltabkommen": {"vertragstatus": "Abolish"},
                "party": localStorage.getItem('user'),
                "status": "Abolish"
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
    laden () {
        //download
        http.get(`/pdf/${localStorage.getItem('user')}/id=${this.props.match.params.vertragnumer}`).then(res => {
            console.log("now downloading?")
        })
        //ReactPDF.render(<PrintPDFDocument />, `${__dirname}/example.pdf`);
    }
    zurücksetzen () {
        this.setState({ 
            klauselNumer: null, //the number of each provision
            anpassen: null, //store user input clause
        })
    }
    render () {
        let jedesZweitePartei = this.state.secondparyArray.map( s => {
            return (<Button outline color="link" size="sm" onClick={() => {
                this.setState({
                    zweiteParty: s.konto,
                    zweiOrt: s.ort,
                    zweiAnderer: s.identitate,
                    zeitNumer: s.kontonumer
                })
                this.setState({ zweitePartyuppercase: s.konto.toUpperCase(), secondparyArray: [] })
            }}>{s.konto}</Button>)
        })
        let jedesKlause = this.state.allesSprach.map(b => {
            let second = b.split("")
            console.log(second)
            if (second[0] === ">" && second[1] === "2") {
                let replace = b.replace('>2', '')
                return (
                <div>
                    <Row className="contract-text-second">{replace}</Row>
                </div>
                )
            } else if (second[1] === ">" && second[2] === "2") {
                let replace = b.replace('>2', '')
                return (
                <div>
                    <Row className="contract-text-second">{replace}</Row>
                </div>
                )
            } else {
                return (
                <div>
                    <br />
                    <Row><h4>{b}</h4></Row>
                </div>
                )
            }
        })
        Font.register({
          family: "Roboto",
          src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf"
        });
        const styles = StyleSheet.create({
            page: {
                flexDirection: 'row',
                backgroundColor: '#E4E4E4'
            },
            section: {
                margin: 10,
                padding: 10,
                flexGrow: 1
            },
            title: {
                fontFamily: "Roboto",
                textAlign: 'center', 
                lineHeight: '3',
                fontWeight: 'bold'
            }
        })
        return (
            <Container>
            {this.state.showalert === true &&
            <div>
                <br />
                <Alert color="warning">{this.state.alertmessage}</Alert>
            </div>}
            <br />
            <Row className="text-trademakr-infor">Main Contract</Row>
            <Row>
                <div className="contract-general">
                    <br />
                    <Row>
                        <Button outline color="link" size="sm" onClick={() => {this.setState({ showPreambleInput: !this.state.showPreambleInput })}}>
                        <h3>{this.state.contractTitle}</h3>
                        </Button>
                    </Row>
                    {this.state.showPreambleInput === true && 
                    <div>
                        <Row className="center-object">
                            <Col sm={4}>
                                <Input type="text" placeholder="Change Contract Title"
                                    onChange={(e) => {this.setState({ contractTitle: e.target.value })}}/>
                            </Col>
                        </Row>
                    </div>}
                    <br />
                    <Row>The {this.state.contractTitle} is signed by</Row>
                    <br />
                    <Row><div><b>{this.state.mainPartyuppercase}</b> hereinafter as FIRST PARTY, the address is {this.state.einOrt}, {this.state.einAnderer}</div></Row>
                    <br />
                    <Row>, and </Row>
                    <br />
                    {this.state.zweiteParty === null && 
                    <Row>
                        <Col sm={2}><Button outline color="primary" size="sm" onClick={() => {this.pointSecondParty()}}>Point Second Party</Button></Col>
                        <Col sm={2}>
                                <Input type="text" placeholder="Type Name"
                                    onChange={(e) => {this.setState({ searchSecondParty: e.target.value })}}/>
                        </Col>
                    </Row>}
                    {this.state.secondparyArray.length > 0 && <Row><Col>{jedesZweitePartei}</Col></Row>}
                    <Row>
                        <div><b>{this.state.zweitePartyuppercase}</b> hereinafter as SECOND PARTY, the address is {this.state.zweiOrt}, {this.state.zweiAnderer}</div>
                    </Row>
                    <br />
                    {this.state.editingMode === false && <div><br /><Row>{jedesKlause}</Row></div>}
                    <Modal show={this.state.showingPDF} closeBox={() => {this.setState({ showingPDF: false })}}>
                        <PDFViewer width="100%" height="95%">
                        <Document>
                            <Page size="A4" style={styles.page}>
                            <View style={styles.section}>
                                <Text style={styles.title} >{this.state.contractTitle}</Text>
                                <Text>
                                    <p>The {this.state.contractTitle} is signed by {this.state.mainPartyuppercase} hereinafter as FIRST PARTY, 
                                    the address is {this.state.einOrt}, Official ID is {this.state.einAnderer}, and {this.state.zweitePartyuppercase} hereinafter 
                                    as SECOND PARTY, the address is {this.state.zweiOrt}, Official ID is {this.state.zweiAnderer}</p>
                                </Text>
                                {jedesKlause}
                            </View>
                            </Page>
                        </Document>
                        </PDFViewer>
                    </Modal>
                </div>
                <EditorContainer />
                {this.state.editingMode === true && 
                    <div>
                    <br />
                    <Row>
                    <Col>
                        <Input type="textarea" placeholder="Input clause here" value={this.state.anpassen}
                            onChange={(e) => {this.setState({ anpassen: e.target.value, saveStatus: "not saved" })}}/>
                    </Col>
                    </Row>
                    <br />
                    <Row className="text-trademakr-infor">
                        <Col sm={2}><Button outline color="primary" size="sm" onClick={() => {
                                //send to Sprach to allesSparch variable
                                let bauen = this.state.anpassen.split("\n")
                                this.setState({ allesSprach: bauen, saveStatus: "temporary saved!" })
                                }}>Save</Button></Col>
                        <Col>{this.state.saveStatus}</Col>
                    </Row>
                    <br />
                    </div>}
                <hr />
                <Row>
                    {(this.state.contractModifyMode === "erste vertrag" || this.state.contractModifyMode === "empty" || this.state.contractModifyMode === "zweite vertrag") &&
                    <Col sm={2}>
                    <Button color="primary" size="sm" onClick={() => {this.setState({ editingMode: !this.state.editingMode })}}>
                        {this.state.editingMode === false && <div>+ Edit Contract</div>}
                        {this.state.editingMode === true && <div>Return</div>}
                    </Button>
                    </Col>}
                    <Col>
                    {this.state.contractModifyMode === "empty" &&
                    <Button color="warning" size="sm" onClick={() => this.erstellen()}>Create Contract</Button>}
                    {(this.state.contractModifyMode === "erste vertrag" || this.state.contractModifyMode === "zweite vertrag") &&
                    <Button color="warning" size="sm" onClick={() => {this.negotiate()}}>Update Contract</Button>}
                    {this.state.contractModifyMode === "zweite vertrag" &&
                    <Button outline color="success" size="sm" onClick={() => {this.ratification()}}>Agree the Contract</Button>}
                    {(this.state.contractModifyMode === "erste vertrag" || this.state.contractModifyMode === "zweite vertrag") &&
                    <Button color="danger" size="sm" onClick={() => this.löschen()}>Delete Contract</Button>}
                    {this.state.contractModifyMode === "zweite vertrag" && //"ratified"
                    <Button color="primary" size="sm" onClick={() => {this.setState({ showingPDF: true })}}>PDF</Button>}
                    </Col>
                </Row>
            </Row>
            </Container>
        )
    }
}

export default Vertrag;
