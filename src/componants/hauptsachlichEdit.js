import React, { Component } from "react";
import './gesichtEin.css'
import { Container, Row } from 'reactstrap'
import http from './http-axios'


class Add extends Component {
    constructor () {
        super ();
        this.state = {
            title: "Input/Update information to create Project",

            projectnumer: null,
            applicantAdd: null,
            titleAdd: null, 
            videoUrlAdd: null,
            locationAdd: null,
            descriptionAdd: null,
            officialSiteAdd: null,
            datePlanned: null,
            insitution: null,
            customized: false,
            publicity: "",
            additionalText: null,

            buttonText: "Create"
        }
        this.schaffen = this.schaffen.bind(this) //Create Charity 
        this.löschen = this.löschen.bind(this) 
    }
    componentDidMount () {
        if (localStorage.getItem('user')) {
            this.setState({ applicantAdd: localStorage.getItem('user') })
        } else { window.location = `/anmeldung` }
        http.get(`/editData/project=${this.props.match.params.projectnumer}`).then((res) => {
            if (res.data.project.length > 0) {
                this.setState({
                    projectnumer: res.data.project[0].projectnumer,
                    applicantAdd: res.data.project[0].antragsteller,
                    titleAdd: res.data.project[0].titel, 
                    videoUrlAdd: res.data.project[0].video,
                    locationAdd: res.data.project[0].ort,
                    descriptionAdd: res.data.project[0].beschreibung,
                    officialSiteAdd: res.data.project[0].website,
                    datePlanned: res.data.project[0].datem,
                    insitution: res.data.project[0].insitution,
                    customized: res.data.project[0].customized,
                    publicity: res.data.project[0].publicity,

                    buttonText: "Update"
                })
            }
        })
    }
    schaffen () {
        if (this.state.titleAdd === null || this.state.descriptionAdd === null) {
            this.setState({ title: '"Project Title" and "Description" should not be blank!' })
        } else {
            const uploadArray = 
                {
                    "projectNumer": this.state.projectnumer,
                    "applicant": this.state.applicantAdd,
                    "title": this.state.titleAdd,
                    "video": this.state.videoUrlAdd,
                    "location":this.state.locationAdd,
                    "description": this.state.descriptionAdd,
                    "website": this.state.officialSiteAdd,
                    "date": this.state.datePlanned,
                    "insitution": this.state.insitution,
                    "customized": this.state.customized,
                    "publicity": this.state.publicity,
                    //"remark": this.state.additionalText
                    "status": this.state.buttonText
                }
            http.post("/addData", uploadArray).then((res) => {
                if (res.data.status === "fail") {
                    this.setState({ title: `Sorry, there is some error: ${res.data.err}` })
                } else {
                    if (res.data.status === "Update Success!!") {
                        this.setState({ title: `Update Project: ${res.data.number} Success!!` })
                        window.location = `/mitglied/id=${localStorage.getItem('user')}`
                    } else {
                        this.setState({ title: `You have created Project: ${res.data.number}` })
                        window.location = `/mitglied/id=${localStorage.getItem('user')}`
                    }
                }
            })
        }
    }
    löschen () {
        if (window.confirm(`Are you sure you want to Delete the Project ${this.state.projectnumer}?`)) {
            let löschen = {
                "project": {"projectnumer": this.state.projectnumer, "status": "abolish"},
            }
            http.post('/deleteData', löschen).then(res => {
                //return if system fail
                if (res.data.status === 'fail') {
                    this.setState({
                        title: "Error: " + res.data.error
                    })
                } else {
                    //create contract success, return to main page
                    window.location = `/mitglied/id=${localStorage.getItem('user')}`
                }
            })
        }
    }
    render () {
        return (
            <Container>
            <Row className="center-object">{this.state.title}</Row>
            <div className="width-control-sieben center-object">
                <hr />
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Project: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><div className="text-trademakr-infor">{this.state.projectnumer}</div></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Applicant: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><div className="text-trademakr-infor">{this.state.applicantAdd}</div></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Project Title: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><input className="input-url" placeholder={this.state.titleAdd} onChange={(e) => this.setState({ titleAdd: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Video Link: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><input className="input-url" placeholder={this.state.videoUrlAdd} onChange={(e) => this.setState({ videoUrlAdd: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Location: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><input className="input-project" placeholder={this.state.locationAdd} onChange={(e) => this.setState({ locationAdd: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Description: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><textarea placeholder={this.state.descriptionAdd} onChange={(e) => this.setState({ descriptionAdd: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Website: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><input className="input-url" placeholder={this.state.officialSiteAdd} onChange={(e) => this.setState({ officialSiteAdd: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Schedule to commence on: </div>
                    <div className="hauptsachlichedit-right text-left-gap"><input type="date" className="input-url" value={this.state.datePlanned} onChange={(e) => this.setState({ datePlanned: e.target.value })}/></div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Insitution: </div>
                    <div className="hauptsachlichedit-right text-left-gap">
                        <select value={this.state.insitution} onChange={(e) => this.setState({ insitution: e.target.value })}>
                            <option value="">---</option>
                            <option value="World Vision Taiwan">World Vision Taiwan</option>
                            <option value="Red Cross">Red Cross</option>
                        </select>
                    </div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Request Customized? </div>
                    <div className="hauptsachlichedit-right text-left-gap">
                        <select value={this.state.customized} onChange={(e) => this.setState({ customized: e.target.value })}>
                            <option value="">---</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                <div className="making-row hauptsachlichedit-center">
                    <div className="hauptsachlichedit-left">Set project Public? </div>
                    <div className="hauptsachlichedit-right text-left-gap">
                        <select value={this.state.publicity} onChange={(e) => {
                                this.setState({ publicity: e.target.value })
                                if (e.target.value === "false") {alert("Only you can see the Project page if you set Private")}
                                }}>
                            <option value="">---</option>
                            <option value="true">Public</option>
                            <option value="false">Private</option>
                        </select>
                    </div>
                </div>
            </div>
            <br />
            <Row className="center-object" sm={5}>
                <button className="default" onClick={e => this.schaffen(e)}>{this.state.buttonText}</button>
                {this.state.buttonText === "Update" && <button className="default" onClick={() => this.löschen()}>Delete</button>}
            </Row>
            </Container>
        )
    }
}

export default Add;