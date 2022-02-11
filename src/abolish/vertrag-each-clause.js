import React, { Component } from "react";
import './gesichtEin.css'
import { Button, Container, Row, Col, Input, Alert } from 'reactstrap'
import http from './http-axios'
import Abteilung from './secionList'


class Vertrag extends Component {
    constructor () {
        super ();
        this.state = {
            showPreambleInput: false,
            contractTitle: "Contract",
            mainParty: null,
            einOrt: null,
            einAnderer: null,
            zweiteParty: null,
            zweiOrt: null,
            zweiAnderer: null,
            spareParty: null,
            dreiOrt: null,
            dreiAnderer: null,

            //set a value to read whether this contract is in modify mode
            //or only one party 
            contractModifyMode: false, 

            //to show editing current provision
            //or add new provision or each clause
            editing: false, //turn on/off general editing
            zeigenAnpassen: true, //to show the editing part, including editing current clause and new clause

            //custom clause input variable
            newSectionTitle: null, //for each new section title variable
            klauselNumer: null, //the number of each provision
            anpassen: null, //store user input clause
            klauselSerielNumer: null, //only use this when modifying clause, to identify which clause in allesSprach
            //once any provision is selected entering editing mode
            zeigenSectionModified: false, //turn on if section is selected for modify the section title
            oldSectionTitle: null, //in case if title need to be changed, just tentative storage

            //show in the contract
            allesSprach: [], //all the language including template and non template
            vorherigSprach: [], //store a version to compare with modified version
            //delete clause
            entfernenSprach: {}, //for temperor delete storage

            //alert
            showalert: false,
            alertmessage: null
        }
        this.hinzufugenBestimmungTitel = this.hinzufugenBestimmungTitel.bind(this) //add new clause to array
        this.sectionModified = this.sectionModified.bind(this) //to modify section title
        this.hinzufugenClasue = this.hinzufugenClasue.bind(this) //add customized clause
        this.erstellen = this.erstellen.bind(this) //generate contract o back
        this.negotiate = this.negotiate.bind(this) //negotiating contract content
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
                http.get(`/vertrag/id=${this.props.match.params.vertragnumer}`).then((res) => {
                    //if get from back is not empty, load the contract
                    //else load default
                    if (res.data.status !== "fail") {
                        //if this is NOT empty contract
                        console.log(res.data.vertragpartei)
                        if (res.data.vertragpartei[0].zweitekonto !== "empty") {
                            //there is second party
                            //turn off create new contract, 
                            //since there are already two parties
                            //turn on modify instead
                            if (res.data.zweiteKonto[0].status == "unfound") {
                                //special case
                                this.setState({ 
                                    contractModifyMode: true, //turn on modifiy mode
                                    alertmessage: res.data.error,
                                    showalert: true,
    
                                    //import first party infor
                                    mainParty: res.data.vertragInfor[0].creater,
                                    einOrt: res.data.konto[0].ort,
                                    einAnderer: res.data.konto[0].identitate,
                                    //import second party infor
                                })
                            } else {
                                //load both parties infor
                                this.setState({ 
                                    contractModifyMode: true, //turn on modifiy mode
                                    showalert: false,
    
                                    //import first party infor
                                    mainParty: res.data.vertragInfor[0].creater,
                                    einOrt: res.data.konto[0].ort,
                                    einAnderer: res.data.konto[0].identitate,
                                    //import second party infor
                                    zweiteParty: res.data.zweiteKonto[0].creater,
                                    zweiOrt: res.data.zweiteKonto[0].ort,
                                    zweiAnderer: res.data.zweiteKonto[0].identitate,
                                })
                            }
                        } else {
                            //second party is marked empty
                            this.setState({
                                contractModifyMode: true, //turn on modifiy mode
                                showalert: false,

                                mainParty: res.data.vertragInfor[0].creater,
                                einOrt: res.data.konto[0].ort,
                                einAnderer: res.data.konto[0].identitate,
                            })
                            //auto add current log-in account as second party
                            //import account contract and charity
                            http.post(`/blankvertrag/id=${localStorage.getItem('user')}`, {"user": localStorage.getItem('user')}).then(res => {
                                //check whether account is first party
                                if (this.state.mainParty === res.data.konto) {
                                    //same, set defualt
                                    this.setState({
                                        zweiteParty: "default contract",
                                        zweiOrt: "default contract",
                                        zweiAnderer: "default contract",
                                    })
                                } else {
                                    //get user infor
                                    this.setState({
                                        zweiteParty: res.data.konto,
                                        zweiOrt: res.data.ort,
                                        zweiAnderer: res.data.identitate,
                                    })
                                }
                            })
                        }
                        //load contract content
                        this.setState({ allesSprach: res.data.alleSprach })
                    } else {
                        //if this is empty contract
                        //import account contract and charity
                        //currently
                        //we assume if load contract fail, 
                        //must be url different
                        http.post(`/blankvertrag/id=${localStorage.getItem('user')}`, {"user": localStorage.getItem('user')}).then(res => {
                            //get user infor
                            this.setState({
                                mainParty: res.data.konto,
                                einOrt: res.data.ort,
                                einAnderer: res.data.identitate
                            })
                        })
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
    hinzufugenBestimmungTitel () {
        //used to be hinzufugenSection()
        //add new provision title and clause to allessprache array 
        if (this.state.newSectionTitle === null || this.state.klauselNumer === null || this.state.anpassen === null) {
            this.setState({
                showalert: true,
                alertmessage: "You might miss provision title, provision number or the content of clause"
            })
        } else {
            //set alert silent first
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //whether how much clause are already there
            //add to very last 
            const allesArray = this.state.allesSprach
            allesArray.push(
                {
                    "title": this.state.newSectionTitle,
                    "klauselnumer": this.state.klauselNumer,
                    "form": "customized",
                    "numer": "customized" + Math.random().toString(36).substr(2),
                    "sprach": this.state.anpassen 
                }
            ) 
            //Store all the update in vorherigSprach
            //while we don't know why....
            const update = this.state.vorherigSprach
            update.push(
                {
                    "title": this.state.newSectionTitle,
                    "klauselnumer": this.state.klauselNumer,
                    "form": "customized",
                    "numer": "customized" + Math.random().toString(36).substr(2),
                    "sprach": this.state.anpassen 
                }
            )
            //sort out order by clause number/alphabetical
            allesArray.sort(function (a, b) {
                if (a.klauselnumer === b.klauselnumer) { return 0 }
                let arrayA = a.klauselnumer.split('.');
                let arrayB = b.klauselnumer.split('.');
                for (let i = 0; i < Math.min(arrayA.length, arrayB.length); i++) {
                    if ((parseInt(arrayA[i]) < parseInt(arrayB[i])) || (arrayA[i] < arrayB[i])) {return -1};
                    if ((parseInt(arrayA[i]) > parseInt(arrayB[i])) || (arrayA[i] > arrayB[i])) {return 1};
                }
                if (arrayA.length < arrayB.length) { return -1 };
                if (arrayA.length > arrayB.length) { return 1 };
                return 0
            })

            this.setState({ allesSprach: allesArray, vorherigSprach: update })
            console.log("Should remain the same: " + JSON.stringify(this.state.vorherigSprach))
            console.log("Update array: " + JSON.stringify(this.state.allesSprach))
            //reset title and clause
            this.zurücksetzen()
        }
    }
    sectionModified () {
        //to modify provition title
        if (this.state.newSectionTitle === null) {
            this.setState({
                showalert: true,
                alertmessage: "Seems like you didn't input provision title, nothing change"
            })
        } else {
            //set alert silent first
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //means change all the title?
            if (window.confirm("Are you sure you want change this title? Al the clause under this title will change")) {
                //loop to find the same title
                for (let i = 0; i < this.state.allesSprach.length; i++) {
                    if (this.state.allesSprach[i].title === this.state.oldSectionTitle) {
                        //create an array as allesSprach
                        const allesArray = this.state.allesSprach
                        allesArray[i].title = this.state.newSectionTitle
                        //then replace the array
                        this.setState({ allesSprach: allesArray, })
                    }
                }
                //then reset
            } else {
                //simply reset
            }
            this.zurücksetzen()
        }
    }
    hinzufugenClasue () {
        //to modify provition title
        if (this.state.klauselSerielNumer === null) {
            this.setState({
                showalert: true,
                alertmessage: "Could be system fail, I am so sorry"
            })
        } else {
            //set alert silent first
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //means modifying current exist clause
            //find index 
            //find the select claue is in which row of allesSprach
            let findIndex = this.state.allesSprach.findIndex( find => find.numer === this.state.klauselSerielNumer )
            //create an array as allesSprach
            const allesArray = this.state.allesSprach
            allesArray[findIndex].klauselnumer = this.state.klauselNumer
            allesArray[findIndex].sprach = this.state.anpassen
            //store in hinzufugenClasue
            //again, we don't know why we have to separate
            //but everytime we update allesSprach, it also update hinzufugenClasue
            //so we merely store all the update here
            const update = this.state.hinzufugenClasue
            update.push({
                "title": allesArray[findIndex].title,
                "klauselnumer": this.state.klauselNumer,
                "form": "customized",
                "numer": "customized" + Math.random().toString(36).substr(2),
                "sprach": this.state.anpassen 
            })
            //sort out order by clause number/alphabetical
            allesArray.sort(function (a, b) {
                if (a.klauselnumer === b.klauselnumer) { return 0 }
                let arrayA = a.klauselnumer.split('.');
                let arrayB = b.klauselnumer.split('.');
                for (let i = 0; i < Math.min(arrayA.length, arrayB.length); i++) {
                    if ((parseInt(arrayA[i]) < parseInt(arrayB[i])) || (arrayA[i] < arrayB[i])) {return -1};
                    if ((parseInt(arrayA[i]) > parseInt(arrayB[i])) || (arrayA[i] > arrayB[i])) {return 1};
                }
                if (arrayA.length < arrayB.length) { return -1 };
                if (arrayA.length > arrayB.length) { return 1 };
                return 0
            })
            //reset temperor variable
            //then replace the array
            this.setState({ allesSprach: allesArray, })
            this.zurücksetzen()
        }
    }
    //nie
    //update allesSprach directly
    //also store vorherigSprach to additional non-template language
    //dunno why both variable update together
    negotiate () {
        //second party negotiate
        //or first party tries to modify
        //we don't store the previous version
        //simply confirms difference before update
        //loop
        //compare each item in array
        /*
        for (let i = 0; i < this.state.allesSprach.length; i++) {
            var count = 0
            for (let j = 0; j < this.state.vorherigSprach.length; j++) {
                if (this.state.allesSprach[i].sprach === this.state.vorherigSprach[j].sprach) {
                    break
                } else {count++}
                console.log(count + " and " + JSON.stringify(this.state.vorherigSprach))
                if (count === this.state.vorherigSprach.length) {
                    //if couldn't find, then there is modified provision
                    //set false first
                    difference = false
                    console.log("We have found one different")
                    //store this to customised db
                    if (this.state.allesSprach[i].form === "customized") {
                        //send to non=template db
                        const anpassen = {
                            "numer": this.state.allesSprach[i].numer, //"customized" + Math.random().toString(36).substr(2),
                            "sprach": this.state.allesSprach[i].sprach
                        }
                        http.post("/anpassen", anpassen).then(res => {
                            //return if system fail
                            if (res.data.status === 'fail') {
                                this.setState({
                                    showalert: true,
                                    alertmessage: "Error: " + res.data.error
                                })
                            } else {
                                this.setState({
                                    showalert: false,
                                    alertmessage: null
                                })
                            }
                        })
                    }
                }
            }
        }
        */
        //simple update non-template language
        for (let j = 0; j < this.state.vorherigSprach.length; j++) {
            if (this.state.vorherigSprach[j].form === "customized") {
                //send to non-template db
                const anpassen = {
                    "numer": this.state.vorherigSprach[j].numer, //"customized" + Math.random().toString(36).substr(2),
                    "sprach": this.state.vorherigSprach[j].sprach
                }
                http.post("/anpassen", anpassen).then(res => {
                    //return if system fail
                    if (res.data.status === 'fail') {
                        this.setState({
                            showalert: true,
                            alertmessage: "Error: " + res.data.error
                        })
                    } else {
                        this.setState({
                            showalert: false,
                            alertmessage: null
                        })
                    }
                })
            }
        }
        //then update latest contract
        if (this.state.vorherigSprach.length > 0) {
            //then there is update
            //store the general infor of vertrag
            const vertragInfor = {
                "vertragpartei": {
                        "vertragnumer": this.state.allesSprach[0].vertragnumer,
                        "zweitekonto": this.state.zweiteParty,
                    },
                "contentvertrag": this.state.allesSprach
            }
            http.post('/updatenVertrag', vertragInfor).then(res => {
                //return if system fail
                if (res.data.status === 'fail') {
                    this.setState({
                        showalert: true,
                        alertmessage: "Error: " + res.data.error
                    })
                } else {
                    //create contract success, return to main page
                    window.location = `/hauptsachlich`
                }
            })
        } else {
            //nothing cahnge, don't submit
            this.setState({
                showalert: true,
                alertmessage: "nothing change, probably you want to agree contract?"
            })
        }
    }
    erstellen() {
        //generate contract to back
        //set alert fort several security
        if (this.state.allesSprach.length < 1) {
            this.setState({
                showalert: true,
                alertmessage: "Please add at least one clause"
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
                alertmessage: ""
            })
            //create for non-template language
            for (var i = 0; i < this.state.allesSprach.length; i++) {
                if (this.state.allesSprach[i].form === "customized") {
                    console.log("ready to send customized sprach")
                    //send to non=template db
                    const anpassen = this.state.allesSprach[i]
                    http.post("/anpassen", anpassen).then(res => {
                        //return if system fail
                        if (res.data.status === 'fail') {
                            this.setState({
                                showalert: true,
                                alertmessage: "Error: " + res.data.error
                            })
                        } else {
                            this.setState({
                                showalert: false,
                                alertmessage: null
                            })
                        }
                    })
                }
            }
            //store all data to back
            //get date
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
    
            today = mm + '/' + dd + '/' + yyyy;
            //store the general infor of vertrag
            const vertragInfor = {
                "jedesvertrag": {
                        "titel": this.state.contractTitle,
                        "vertragnumer": "vertrag" + Math.random().toString(36).substr(2),
                        "creater": this.state.mainParty,
                        "creatzeit": today,
                        "vertragstatus": "created"
                    },
                "contentvertrag": this.state.allesSprach
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
                    window.location = `/hauptsachlich`
                }
            })
        }
    }
    zurücksetzen () {
        this.setState({ 
            editing: false, //turn off generall editing
            zeigenAnpassen: true, //turn off custom editing
            newSectionTitle: null, //for each new section title variable
            oldSectionTitle: null, //in case provision title need to be change, just tentative storage
            klauselNumer: null, //the number of each provision
            anpassen: null, //store user input clause
            klauselSerielNumer: null, //although nothing store here, better set zero in case
            zeigenSectionModified: false //change back to add new section title
        })
    }
    render () {
        //alles clause, seciton title
        let vertragBauen = this.state.allesSprach.map( b => {
            //split clause number, so title get only the one before commen
            let provisionTitleNumer = b.klauselnumer.split('.')
            //create an index for later use
            let findIndex = this.state.allesSprach.findIndex( find => find === b )
            //create first title plus clause
            //then create the clause follow first title
            //then create second title plus clause
            //then create the claues dollow second title
            return (
                <div>
                    <br />
                    {b === this.state.allesSprach[0] && 
                    <div>
                    <Row>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                //klauselNumer: "You select provision title: " + b.title,
                                anpassen: "You select provision title: " + b.title,
                                zeigenSectionModified: false,  //Don't want to change title
                            })
                        }}><h5>{provisionTitleNumer[0]}. {b.title}:</h5></Button></Col>
                    </Row>
                    <Row>
                        <Col sm={1} className="clause-title-text">{b.klauselnumer}: </Col>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                oldSectionTitle: b.title, //in case provision title need to be change
                                klauselNumer: b.klauselnumer,
                                anpassen: b.sprach,
                                klauselSerielNumer: b.numer, //only for modify clause, to identify which clause in alleSprach
                                zeigenSectionModified: true,  //turn on modify mode
                                editing: true, //show editing page
                                zeigenAnpassen: true //show custom area 
                            })
                        }}><h5>{b.sprach}</h5></Button></Col>
                    </Row>
                    </div>}
                    {b !== this.state.allesSprach[0] && b.title === this.state.allesSprach[0].title && 
                    <div>
                    <Row>
                        <Col sm={1} className="clause-title-text">{b.klauselnumer}: </Col>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                oldSectionTitle: b.title, //in case provision title need to be change
                                klauselNumer: b.klauselnumer,
                                anpassen: b.sprach,
                                klauselSerielNumer: b.numer, //only for modify clause, to identify which clause in alleSprach
                                zeigenSectionModified: true,  //turn on modify mode
                                editing: true, //show editing page
                                zeigenAnpassen: true //show custom area 
                            })
                        }}><h5>{b.sprach}</h5></Button></Col>
                    </Row>
                    </div>}
                    {b !== this.state.allesSprach[0] && b.title !== this.state.allesSprach[findIndex - 1].title && 
                    <div>
                    <Row>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                //klauselNumer: "You select provision title: " + b.title,
                                anpassen: "You select provision title: " + b.title,
                                zeigenSectionModified: false,  //Don't want to change title
                            })
                        }}><h5>{provisionTitleNumer[0]}. {b.title}:</h5></Button></Col>
                    </Row>
                    <Row>
                        <Col sm={1} className="clause-title-text">{b.klauselnumer}: </Col>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                oldSectionTitle: b.title, //in case provision title need to be change
                                klauselNumer: b.klauselnumer,
                                anpassen: b.sprach,
                                klauselSerielNumer: b.numer, //only for modify clause, to identify which clause in alleSprach
                                zeigenSectionModified: true,  //turn on modify mode
                                editing: true, //show editing page
                                zeigenAnpassen: true //show custom area 
                            })
                        }}><h5>{b.sprach}</h5></Button></Col>
                    </Row>
                    </div>}
                    {b !== this.state.allesSprach[0] && b.title !== this.state.allesSprach[0].title && b.title === this.state.allesSprach[findIndex - 1].title && 
                    <div>
                    <Row>
                        <Col sm={1} className="clause-title-text">{b.klauselnumer}: </Col>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            //confirm selected section
                            this.setState({ 
                                newSectionTitle: b.title,
                                oldSectionTitle: b.title, //in case provision title need to be change
                                klauselNumer: b.klauselnumer,
                                anpassen: b.sprach,
                                klauselSerielNumer: b.numer, //only for modify clause, to identify which clause in alleSprach
                                zeigenSectionModified: true,  //turn on modify mode
                                editing: true, //show editing page
                                zeigenAnpassen: true //show custom area 
                            })
                        }}><h5>{b.sprach}</h5></Button></Col>
                    </Row>
                    </div>}
                </div>
            )
        })
        return (
            <Container>
            {this.state.showalert === true &&
            <div>
                <br />
                <Alert color="warning">{this.state.alertmessage}</Alert>
            </div>}
            <br />
            <Row>
                <Col>
                    <Row className="text-trademakr-infor">Main Contract</Row>
                    <br />
                    <Row>
                        <Button outline color="link" size="sm" onClick={() => {this.setState({ showPreambleInput: !this.state.showPreambleInput })}}>
                            <h3>{this.state.contractTitle}</h3>
                            <br />
                            <Row>
                                The {this.state.contractTitle} is signed by <row><b>{this.state.mainParty}</b> hereinafter as FIRST PARTY</row>
                                {this.state.einOrt !== null && <div> the address is {this.state.einOrt}</div>}
                                {this.state.einAnderer !== null && <div> {this.state.einAnderer}</div>}
                                , and <row><b>{this.state.zweiteParty}</b> hereinafter as SECOND PARTY</row>
                                {this.state.zweiOrt !== null && <div> the address is {this.state.zweiOrt}</div>}
                                {this.state.zweiAnderer !== null && <div> {this.state.zweiAnderer}</div>}
                                {this.state.spareParty !== null && <div>, also <b>{this.state.spareParty}</b> hereinafter as THIRD PARTY</div>}
                                {this.state.dreiOrt !== null && <div> the address is {this.state.dreiOrt}</div>}
                                {this.state.dreiAnderer !== null && <div> {this.state.dreiAnderer}</div>}
                            </Row>
                        </Button>
                    </Row>
                {this.state.showPreambleInput === true && 
                <div>
                    <br />
                    <Row><Col><Button outline color="link" size="sm" onClick={() => {this.setState({ showPreambleInput: false })}}>X</Button></Col></Row>
                    <Row className="center-object">
                        <Col sm={3}>Contract Title:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ contractTitle: e.target.value })}/>
                        </Col>
                    </Row>
                </div>}
                    <Row>{vertragBauen}</Row>
                    <hr />
                    <Row>
                        <Col sm={2}>
                            {this.state.editing === false &&
                            <Button color="primary" size="sm" onClick={() => {this.setState({ editing: true })}}>+ Edit Contract</Button>}
                            {this.state.editing === true &&
                            <Button color="primary" size="sm" onClick={() => {this.setState({ editing: false })}}>- close Editing</Button>}
                            {this.state.editing === true && 
                            <div>
                            <br />
                            <Row><Col>
                                <Button outline color="link" size="sm" onClick={() => {this.zurücksetzen()}}>Reset</Button>
                            </Col></Row>
                            <br />
                            <Row className="text-trademakr-infor">Custom Language</Row>
                            <br />
                            <Row><Col><Button outline color="primary" size="sm" onClick={() => this.setState({ zeigenAnpassen: true })}>Customize</Button></Col></Row>
                            </div>}
                        </Col>
                        <Col>
                        {this.state.allesSprach.length > 0 && this.state.contractModifyMode === false &&
                        <Button color="warning" size="sm" onClick={() => this.erstellen()}>Create Contract</Button>}
                        {this.state.allesSprach.length > 0 && this.state.contractModifyMode === true &&
                        <Button color="warning" size="sm" onClick={() => {this.negotiate()}}>Modify Contract</Button>}
                        {this.state.allesSprach.length > 0 && this.state.contractModifyMode === true &&
                        <Button color="success" size="sm" onClick={() => {console.log("ready")}}>Agree the Contract</Button>}
                        {this.state.zeigenAnpassen === true && this.state.editing === true &&
                        <div>
                        <br />
                        <Row>
                        <Col sm={3}>
                            <Input type="text" placeholder="Enter new provision title"
                                onChange={(e) => this.setState({ newSectionTitle: e.target.value })}/>
                        </Col>
                        {this.state.zeigenSectionModified === false && //simply creating new section
                        <Col className="center-text">Type Provision Title: {this.state.newSectionTitle}</Col>}
                        {this.state.zeigenSectionModified === true && //simply creating new section
                        <Col className="center-text">Selected Provision Title: {this.state.newSectionTitle}</Col>}
                        {this.state.zeigenSectionModified === true && //modifying the section title
                        <Col className="center-text"><Button color="primary" size="sm" onClick={() => {this.sectionModified()}}>Modify Provision Title: <b>{this.state.newSectionTitle}</b></Button></Col>}
                        </Row>
                        <div>
                            <br />
                            <Row>
                            <Col sm={1}>
                                <Input type="text" placeholder="Enter number of clause"
                                    onChange={(e) => this.setState({ klauselNumer: e.target.value })}/>
                            </Col>
                            <Col className="center-text">The Provision Number is: {this.state.klauselNumer}</Col>
                            </Row>
                            <br />
                            <Row>
                            <Col>
                                <Input type="textarea" placeholder="Enter your clause here"
                                    onChange={(e) => this.setState({ anpassen: e.target.value })}/>
                            </Col>
                            {this.state.zeigenSectionModified === false &&
                            <Col className="center-text" sm={2}>
                                <Button color="primary" size="sm" onClick={() => {this.hinzufugenBestimmungTitel()}}>+ New Provision</Button>
                            </Col>}
                            {this.state.zeigenSectionModified === true &&
                            <Col className="center-text" sm={2}>
                                <Button color="primary" size="sm" onClick={() => {this.hinzufugenClasue()}}>+ Modify Provision</Button>
                            </Col>}
                            </Row>
                            <br />
                            {this.state.anpassen !== null && <Row><Col className="text-trademakr-infor">{this.state.anpassen}</Col></Row>}
                            <br />
                            <Row>
                                {this.state.zeigenSectionModified === true &&
                                <Col>
                                <Button color="outline-danger" size="sm" onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this clause?")) {
                                        //find index of the clause in allesSprach
                                        let findIndex = this.state.allesSprach.findIndex( find => find.numer === this.state.klauselSerielNumer )
                                        //remove one item at index
                                        //create an array
                                        const allesArray = this.state.allesSprach
                                        allesArray.splice(findIndex, 1)
                                        this.setState({ allesSprach: allesArray })
                                        //then reset
                                        this.setState({
                                    
                                            editing: false, //turn off generall editing
                                            zeigenAnpassen: true, //remain custom editing
                                            newSectionTitle: null, //for each new section title variable
                                            oldSectionTitle: null, //in case provision title need to be change, just tentative storage
                                            klauselNumer: null, //the number of each provision
                                            anpassen: null, //store user input clause
                                            klauselSerielNumer: null, //although nothing store here, better set zero in case
                                            zeigenSectionModified: false //change back to add new section title
                                        })
                                    } else {
                                        //don't do anything
                                    }}}>- Delete this Provision</Button>
                                </Col>}
                            </Row>
                        </div>
                        </div>}
                        </Col>
                    </Row>
                </Col>
            </Row>
            </Container>
        )
    }
}

export default Vertrag;
