import React, { Component } from "react";
import './gesichtEin.css'
import { Button, Container, Row, Col, Input, Alert } from 'reactstrap'
import http from './http-axios'
import Abteilung from './secionList'


//this version seperate provition title and the rest clause

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
            contractModifyMode: true, 

            //to editing or add new provision or each clause
            editing: false, //turn on/off general editing
            provisionAddModify: false,  //only of provision add and modify
            showSectionTitleSetting: false,
            newSectionTitle: null, //for each new section title variable
            zeigenSectionModified: false, //turn on if section is selected for modify the section title

            //show template Sprache editing
            showSectionOption: false, 
            showBothParty: false,
            sampleSprach: [], //store template language from back
            showFirstParty: false,
            erstenPartei: [], //store first party language
            showSecondParty: false,
            zweitePartei: [],

            //custom clause
            zeigenAnpassen: false,
            anpassen: null, //store user input clause
            selectSection: null, //simply a variable for storing the selected section
            showSelectedSection: null,

            //show in the contract
            clauseSprach: [], //temperor storage for the whole psrache inform before store in allesSprach
            allesSprach: [], //all the language including template and non template

            //delete clause
            entfernenSprach: {}, //for temperor delete storage

            //alert
            showalert: false,
            alertmessage: null
        }
        this.sectionOption = this.sectionOption.bind(this) //left section option
        this.hinzufugenSection = this.hinzufugenSection.bind(this) //create new section by section title
        this.sectionModified = this.sectionModified.bind(this) //to modify section title
        this.hinzufugenSprach = this.hinzufugenSprach.bind(this) // add Sprache to each section
        this.hinzufugenClasue = this.hinzufugenClasue.bind(this) //add customized clause
        this.erstellen = this.erstellen.bind(this) //generate contract o back
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
                    if (res.data.vertragInfor.length > 0) {
                        //if this is NOT empty contract
                        if (res.data.vertragpartei.length > 0) {
                            //there is second party
                            //turn off create new contract, 
                            //since there are already two parties
                            //turn on modify instead
                            this.setState({ contractModifyMode: true })
                        } else {
                            //no second party
                            this.setState({
                                mainParty: res.data.vertragInfor[0].creater,
                                einOrt: res.data.konto[0].ort,
                                einAnderer: res.data.konto[0].identitate,
                                contractModifyMode: false
                            })
                            //auto add current log-in account as second party
                            //import account contract and charity
                            http.post(`/blankvertrag/id=${localStorage.getItem('user')}`, {"user": localStorage.getItem('user')}).then(res => {
                                //get user infor
                                this.setState({
                                    zweiteParty: res.data.konto,
                                    zweiOrt: res.data.ort,
                                    zweiAnderer: res.data.identitate,
                                })
                            })
                        }
                        //load contract content
                        const ladenVertrag = [{
                            "title": res.data.alleSprach[0].title,
                            "clauseInfor": []
                        }]
                        for (let i = 0; i < res.data.alleSprach.length; i++) {
                            //check the title
                            //add all title first
                            if (res.data.alleSprach[i].title !== res.data.alleSprach[0].title && res.data.alleSprach[i].title !== res.data.alleSprach[i-1].title) {
                                //upload follow title
                                var followTitel = {
                                    "title": res.data.alleSprach[0].title,
                                    "clauseInfor": []
                                }
                                ladenVertrag.push(followTitel)
                            }
                            //load rest
                            for ( let j = 0; j < ladenVertrag.length; j++) {
                                if (res.data.alleSprach[i].title === ladenVertrag[j].title) {
                                    //push each klausel
                                    ladenVertrag[j].clauseInfor.push(res.data.alleSprach[i])
                                }
                            }
                        }
                        this.setState({ allesSprach: ladenVertrag })
                        console.log("title: " + res.data.alleSprach[0].title)
                    } else {
                        //if this is empty contract
                        //import account contract and charity
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
    sectionOption (e) {
        //open template language editing
        //show the area zone first
        this.setState({ showSectionOption: !this.state.showSectionOption, provisionAddModify: false, zeigenAnpassen: false })
        //load data from DB
        http.post("/nehmenMunsterSprach", {"section": e.target.value}).then(res => {
            //get each part of template langugage
            if (res.data.status === 'fail' || res.data[0] == undefined) {
                this.setState({
                    showalert: true,
                    alertmessage: "Error: " + JSON.stringify(res.data.error)
                })
            } else {
                //set alert silent first
                this.setState({
                    showalert: false,
                    alertmessage: null
                })
                //prepare for each party status sprache
                const bothParty = []
                const firstParty = []
                const secondParty = []
                var i
                const array = res.data[0] //becasue it is [[{},{}.{}]] from the back, so the length is 1, take res.data[0] to get [{},{}.{}]
                for (i = 0; i < res.data[0].length; i++) {
                    if (array[i].teil === 'a') {
                        bothParty.push({
                            "form": e.target.value,
                            "numer": array[i].numer,
                            "teil": array[i].teil,
                            "sprach": array[i].sprach
                        })
                    } else if (array[i].teil === 'b') {
                        firstParty.push({
                            "form": e.target.value,
                            "numer": array[i].numer,
                            "teil": array[i].teil,
                            "sprach": array[i].sprach
                        })
                    } else {
                        secondParty.push({
                            "form": e.target.value,
                            "numer": array[i].numer,
                            "teil": array[i].teil,
                            "sprach": array[i].sprach
                        })
                    }
                }
                this.setState({ sampleSprach: bothParty, erstenPartei: firstParty, zweitePartei: secondParty })
                this.setState({ showBothParty: true, showFirstParty: false, showSecondParty: false })
            }
        })
    }
    hinzufugenSection () {
        //add each section to allessprache array before final submition 
        //add provision title
        if (this.state.newSectionTitle === null) {
            this.setState({
                showalert: true,
                alertmessage: "Please enter section title"
            })
        } else {
            //set alert silent first
            this.setState({
                showalert: false,
                alertmessage: null
            })
            if (this.state.allesSprach.length < 1) {
                //if there is empty, create new
                this.setState({ 
                    allesSprach: 
                        [{
                            "title": this.state.newSectionTitle,
                            "clauseInfor": []//this.state.clauseSprach //detail of each clause, both parties or single party
                        }] 
                })
            } else {
                const reihe = this.state.allesSprach
                reihe.push(
                    {
                        "title": this.state.newSectionTitle,
                        "clauseInfor": []//this.state.clauseSprach //detail of each clause, both parties or single party
                    }
                ) 
                this.setState({ allesSprac: reihe })
            }
            //reset title and clause
            this.setState({
                showSectionOption: false,
                showSectionTitleSetting: false,
                newSectionTitle: null,
                editing: false, //turn off generall editing
                zeigenAnpassen: false, //turn off custom editing
                showSectionOption: false, //turn off tempalte editing
                zeigenSectionModified: false //change back to add new section title
                //clauseSprach: []
            })
        }
    }
    sectionModified () {
        //to modify provition title
        if (this.state.newSectionTitle === null) {
            this.setState({
                showalert: true,
                alertmessage: "Please enter provision title"
            })
        } else {
            //set alert silent first
            this.setState({
                showalert: false,
                alertmessage: null
            })
            //find index 
            let findIndex = this.state.allesSprach.findIndex( find => find.title === this.state.selectSection )
            //then replace the array
            const allesArray = this.state.allesSprach
            allesArray[findIndex].title = this.state.newSectionTitle
            //reset temperor variable
            this.setState({ allesSprach: allesArray, 
                            zeigenAnpassen: false,
                            anpassen: "Please enter clause you want", //store user input clause
                            selectSection: null,
                            showSelectedSection: null,
                            newSectionTitle: null, //reset input section title
                            editing: false, //turn off generall editing
                            zeigenAnpassen: false, //turn off custom editing
                            showSectionOption: false, //turn off tempalte editing
                            zeigenSectionModified: false //change back to add new section title
                })
        }
    }
    hinzufugenSprach () {
        //using e.target.value passing fail !
        //add template Sprache to selected section
        //set alarm if no clause is selected
        //provision title must be selected
        if (this.state.selectSection === null) {
            this.setState({
                showalert: true,
                alertmessage: "Please select one provision"
            })
        } else {
            //turn off alart
            this.setState({
                showalert: false,
                alertmessage: ""
            })
            /////////////
            //start from here
            //need to add to specific clause
            let last = this.state.allesSprach.length
            if (this.state.allesSprach[last - 1].clauseInfor < 1 && this.state.allesSprach.length === 1) {
                //there is no Sprache yet
                //and just very first section
                //create last element
                const lastElement = {
                    "title": this.state.allesSprach[last -1].title, //section title
                    "clauseInfor": this.state.clauseSprach 
                }
                //now get the whole array, replace the very last one
                this.setState({ allesSprach: [lastElement], clauseSprach: [] })
            } else if (this.state.allesSprach[last - 1].clauseInfor < 1 && this.state.allesSprach.length > 1) {
                //there is no Sprache yet
                //but is not first section
                //create last element
                const lastElement = {
                    "title": this.state.allesSprach[last -1].title, //section title
                    "clauseInfor": this.state.clauseSprach
                }
                //now get the whole array, replace the very last one
                const allesArray = this.state.allesSprach
                allesArray[last -1] = lastElement
                this.setState({ allesSprach: allesArray, clauseSprach: [] })
            } else {
                //set an array is current array
                const currentArray = this.state.allesSprach[last - 1].clauseInfor
                //add the Sprache
                currentArray.push(this.state.clauseSprach[0])
                //create last element
                const lastElement = {
                    "title": this.state.allesSprach[last - 1].title, //section title
                    "clauseInfor": currentArray
                }
                //now get the whole array, replace the very last one
                const allesArray = this.state.allesSprach
                allesArray[last -1] = lastElement
                //const neuArray = allesArray.splice(last-1, 1, lastElement)
                this.setState({ allesSprach: allesArray, clauseSprach: [] })
            }
        }
    }
    hinzufugenClasue () {
        //add customized clause to specific Section
        //create an element to put customized language
        const customized = { 
            "form": "customized",
            "numer": "customized" + Math.random().toString(36).substr(2),
            "sprach": this.state.anpassen 
        }
        //provision title must be selected
        if (this.state.selectSection === null) {
            this.setState({
                showalert: true,
                alertmessage: "Please select one provision"
            })
        } else {
            //turn off alart
            this.setState({
                showalert: false,
                alertmessage: ""
            })
            const findWhichArray = this.state.allesSprach.find( find => find.title === this.state.selectSection ).clauseInfor
            findWhichArray.push(customized)
            //find index 
            let findIndex = this.state.allesSprach.findIndex( find => find.title === this.state.selectSection )
            //then replace the array
            const allesArray = this.state.allesSprach
            allesArray[findIndex].clauseInfor = findWhichArray
            //reset temperor variable
            this.setState({ allesSprach: allesArray, 
                            zeigenAnpassen: false,
                            anpassen: null, //store user input clause
                            selectSection: null,
                            showSelectedSection: null,
                            editing: false, //turn off generall editing
                            zeigenAnpassen: false, //turn off custom editing
                            showSectionOption: false, //turn off tempalte editing
                            zeigenSectionModified: false //change back to add new section title
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
            console.log(this.state.allesSprach[0].clauseInfor)
            for (var i = 0; i < this.state.allesSprach.length; i++) {
                for (var j = 0; j < this.state.allesSprach[i].clauseInfor.length; j++) {
                    if (this.state.allesSprach[i].clauseInfor[j].form === "customized") {
                        console.log("ready to send customized sprach")
                        //send to non=template db
                        const anpassen = this.state.allesSprach[i].clauseInfor[j]
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
    render () {
        //section option at left side
        let section = Abteilung.map( b => {
            return (
                <Row><Col className="object-right">
                    <Button outline color="link" size="sm" value={b.title} onClick={(e) => this.sectionOption(e, "value")}>{b.title}</Button>
                </Col></Row>
            )
        }) 
        //bottom Sprache option
        //both party sample language
        let bothSprach = this.state.sampleSprach.map( c => {
            return (
                <div>
                <Row className="center-object">.</Row>
                <br />
                <Row>
                    <Col sm={1}># {this.state.sampleSprach.indexOf(c) + 1}</Col>
                    <Col><Button outline color="link" size="sm" onClick={() => 
                        {
                        const array = this.state.clauseSprach //get all current sprach array
                        array.push(c) //push the selected one
                        this.setState({ clauseSprach: array })
                        this.hinzufugenSprach()
                        }}><div className="text-left">{c.sprach}</div></Button></Col>
                </Row>
                </div>
            )
        }) 
        //bottom Sprache option
        //first party sample language
        let ernsteSprach = this.state.erstenPartei.map( c => {
            return (
                <div>
                <Row className="center-object">.</Row>
                <br />
                <Row>
                    <Col sm={1}># {this.state.erstenPartei.indexOf(c) + 1}</Col>
                    <Col><Button outline color="link" size="sm" onClick={() => 
                        {
                        const array = this.state.clauseSprach //get all current sprach array
                        array.push(c) //push the selected one
                        this.setState({ clauseSprach: array })
                        this.hinzufugenSprach()
                        }}><div className="text-left">{c.sprach}</div></Button></Col>
                </Row>
                </div>
            )
        }) 
        //bottom Sprache option
        //second party sample language
        let zweiteSprach = this.state.zweitePartei.map( c => {
            return (
                <div>
                <Row className="center-object">.</Row>
                <br />
                <Row>
                    <Col sm={1}># {this.state.zweitePartei.indexOf(c) + 1}</Col>
                    <Col><Button outline color="link" size="sm" onClick={() => //this.hinzufugenSprach(e, "value")
                        {
                        const array = this.state.clauseSprach //get all current sprach array
                        array.push(c) //push the selected one
                        this.setState({ clauseSprach: array })
                        this.hinzufugenSprach()
                        }}><div className="text-left">{c.sprach}</div></Button></Col>
                </Row>
                </div>
            )
        }) 
        //alles clause, seciton title
        let vertragBauen = this.state.allesSprach.map( b => {
            //obtain each sprach first
            let jedesSprach = b.clauseInfor.map( k => {
                return (
                    <div>
                    <br />
                    <Row>
                        <Col sm={1}>{this.state.allesSprach.indexOf(b) + 1}. {b.clauseInfor.indexOf(k) + 1}</Col>
                        <Col><Button outline color="link" size="sm" onClick={() => {
                            this.setState({ editing: true, zeigenAnpassen: true, anpassen: k.sprach })
                            /*
                            if (window.confirm("Are you sure you want to delete this clause?")) {
                                //take out hte selected Sprach
                                const takeOut = b.clauseInfor.filter( r => r.sprach !== k.sprach )
                                //set new element ready to modify
                                const ersatze = {
                                    "title": b.title,
                                    "clauseInfor": takeOut
                                }
                                const currentVertrag = this.state.allesSprach
                                //replace the specific inde element to update one
                                currentVertrag[this.state.allesSprach.indexOf(b)] = ersatze
                                this.setState({ allesSprach: currentVertrag })
                            } else {
                                //don't do anything
                            }
                            */
                        }}><div className="text-left">{k.sprach}</div></Button></Col>
                    </Row></div>
                )
            })
            return (
                <div>
                    <br />
                    <Row><Col><Button outline color="link" size="sm" onClick={() => {
                        //confirm selected section
                        this.setState({ 
                            selectSection: b.title, 
                            showSelectedSection: `${this.state.allesSprach.indexOf(b) + 1}. ${b.title}`, 
                            zeigenSectionModified: !this.state.zeigenSectionModified,
                        })
                    }}><h5>{this.state.allesSprach.indexOf(b) + 1}. {b.title}:</h5></Button></Col></Row>
                    <Row>{jedesSprach}</Row>
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
                    {/*
                    <Row className="center-object">
                        <Col sm={3}>First Party:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ mainParty: e.target.value })}/>
                        </Col>
                    </Row>
                    */}
                    <Row className="center-object">
                        <Col sm={3}>First Party Address:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ einOrt: e.target.value })}/>
                        </Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={3}>First Party ID:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                placeholder="could be Identity, social number"
                                onChange={(e) => this.setState({ einAnderer: e.target.value })}/>
                        </Col>
                    </Row>
                    {/*
                    <Row className="center-object">
                        <Col sm={3}>Second Party:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ zweiteParty: e.target.value })}/>
                        </Col>
                    </Row>
                    */}
                    <Row className="center-object">
                        <Col sm={3}>Second Party Address:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ zweiOrt: e.target.value })}/>
                        </Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={3}>Second Party ID:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                placeholder="could be Identity, social number"
                                onChange={(e) => this.setState({ zweiAnderer: e.target.value })}/>
                        </Col>
                    </Row>
                    {/*
                    <Row className="center-object">
                        <Col sm={3}>Third Party:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ spareParty: e.target.value })}/>
                        </Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={3}>Third Party Address:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                onChange={(e) => this.setState({ dreiOrt: e.target.value })}/>
                        </Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={3}>Third Party Other:</Col>
                        <Col sm={4}>
                            <Input type="text" 
                                placeholder="could be Identity, social number"
                                onChange={(e) => this.setState({ dreiAnderer: e.target.value })}/>
                        </Col>
                    </Row>
                    */}
                </div>}
                    <Row>{vertragBauen}</Row>
                    <hr />
                    <Row>
                        <Col sm={2}>
                            {this.state.editing === false &&
                            <Button color="primary" size="sm" onClick={() => {this.setState({ editing: true })}}>+ Edit Contract</Button>}
                            {this.state.editing === true &&
                            <Button color="primary" size="sm" onClick={() => {this.setState({ editing: false })}}>- close Editing</Button>}
                            {/*
                            <Row>
                            <Button outline color="primary" size="sm" 
                                onClick={() => {this.setState({ showSectionTitleSetting: !this.state.showSectionTitleSetting })}}
                                >+ New Section/Modify Section Title</Button>
                            </Row>
                            */}
                            {this.state.editing === true && 
                            <div>
                            <br />
                            <Row className="text-trademakr-infor">Provision</Row>
                            <br />
                            <Row><Col><Button outline color="primary" size="sm" onClick={() => this.setState({ provisionAddModify: !this.state.provisionAddModify, zeigenAnpassen: false, showSectionOption: false })}>Add/Modify</Button></Col></Row>
                            <br />
                            <Row className="text-trademakr-infor">Custom Language</Row>
                            <br />
                            <Row><Col><Button outline color="primary" size="sm" onClick={() => this.setState({ zeigenAnpassen: !this.state.zeigenAnpassen, provisionAddModify: false, showSectionOption: false })}>Customize</Button></Col></Row>
                            <br />
                            <Row className="text-trademakr-infor">Sample Language</Row>
                            <br />
                            <Row>{section}</Row>
                            </div>}
                        </Col>
                        <Col>
                        {this.state.allesSprach.length > 0 && this.state.contractModifyMode === false &&
                        <Button color="warning" size="sm" onClick={() => this.erstellen()}>Create Contract</Button>}
                        {this.state.allesSprach.length > 0 && this.state.contractModifyMode === true &&
                        <Button color="warning" size="sm" onClick={() => {console.log("ready")}}>Modify Contract</Button>}
                        {this.state.provisionAddModify === true && this.state.editing === true &&
                        <div>
                        <br />
                        <Row>
                        <Col sm={3}>
                            <Input type="text" placeholder={this.state.newSectionTitle}
                                onChange={(e) => this.setState({ newSectionTitle: e.target.value })}/>
                        </Col>
                        {this.state.zeigenSectionModified === false && //simply creating new section
                        <Col className="center-text"><Button color="primary" size="sm" onClick={() => {this.hinzufugenSection()}}>+ New Provision</Button></Col>}
                        {this.state.zeigenSectionModified === true && //modifying the section title
                        <Col className="center-text"><Button color="primary" size="sm" onClick={() => {this.sectionModified()}}>Modify <b>{this.state.showSelectedSection}</b></Button></Col>}
                        </Row>
                        </div>}
                        {this.state.zeigenAnpassen === true &&
                        <div>
                            <hr />
                            <Row>
                            <Col sm={1}><Button outline color="link" size="sm" onClick={() => {this.setState({ zeigenAnpassen: false })}}>X</Button></Col>
                            </Row>
                            <Row>
                            <Col>
                                <Input type="textarea" placeholder="Enter your clause here"
                                    onChange={(e) => this.setState({ anpassen: e.target.value })}/>
                            </Col>
                            <Col className="center-text" sm={2}><Button color="primary" size="sm" onClick={() => {this.hinzufugenClasue()}}>+ Add/Modify Clause</Button></Col>
                            </Row>
                            <br />
                            {this.state.anpassen !== null && <Row><Col className="text-trademakr-infor">{this.state.anpassen}</Col></Row>}
                            <br />
                            <Row><Col sm={3}>The clause will be added to: </Col><Col className="text-trademakr-infor">{this.state.showSelectedSection}</Col></Row>
                        </div>}
                        {this.state.showSectionOption === true && 
                        <div>
                            <hr />
                            <Alert color="primary">
                                <Row>
                                <Col><Button outline color="link" size="sm" onClick={() => {this.setState({ showSectionOption: false })}}>X</Button></Col>
                                <Col>Please select sample language from below</Col>
                                <Col sm={1}><Button outline color="link" size="sm" 
                                    onClick={() => this.setState({ showBothParty: true, showFirstParty: false, showSecondParty: false })}>Both Parties</Button></Col>
                                <Col sm={1}><Button outline color="link" size="sm"
                                    onClick={() => this.setState({ showBothParty: false, showFirstParty: true, showSecondParty: false })}>First Parties</Button></Col>
                                <Col sm={1}><Button outline color="link" size="sm"
                                    onClick={() => this.setState({ showBothParty: false, showFirstParty: false, showSecondParty: true })}>Second Parties</Button></Col>
                                </Row>
                            </Alert>
                            <br />
                            <Row><Col sm={3}>The clause will be added to: </Col><Col className="text-trademakr-infor">{this.state.showSelectedSection}</Col></Row>
                            {this.state.showBothParty === true && <Row>{bothSprach}</Row>}
                            {this.state.showFirstParty === true && <Row>{ernsteSprach}</Row>}
                            {this.state.showSecondParty === true && <Row>{zweiteSprach}</Row>}
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
