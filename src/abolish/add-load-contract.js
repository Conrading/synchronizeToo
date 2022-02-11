import React, { Component } from "react";
import './gesichtEin.css'
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap'
import http from './http-axios'


class Add extends Component {
    constructor () {
        super ();
        this.state = {
            title: "Please input information to create Collaboration",

            applicantAdd: localStorage.getItem('user'), //add applicant name
            titleAdd: null, 
            videoUrlAdd: null,
            imgUrlAdd: null,
            locationAdd: null,
            descriptionAdd: null,
            officialSiteAdd: null,
            dateCreated: null,
            additionalText: null,

            showContractList: false,
            loadKontoVertrag: [], //load the current contract of users from back
            joinVertrag: null //the contract joinging charity work
        }
        this.schaffen = this.schaffen.bind(this) //Create Charity 
        this.annehmen = this.annehmen.bind(this) //pop-out to select contracts
    }
    componentDidMount () {
        if (localStorage.getItem('user')) {
            //if currently it is log in, load the contracts
            http.post(`/addData/id=:kontoname`, {"user": localStorage.getItem('user')}).then((res) => {
                //separate if there is no contract from users or charity work
                if (res.data.vertrag === "zero") {
                    //no contracts yet
                    this.setState({ title: "You might also need to generate new contract for this charity work" })
                } else {
                    //this.setState({ loadKontoVertrag: res.data.vertrag })
                }
            })
        }
    }
    annehmen () {
        //import the contracts of users
    }
    schaffen () {
        //check whether user log-in
        //get token certificate
        //get token from localstorage
        //but couldn't confirm token expire
        const zertifikat = {"token": localStorage.getItem('token')}
        console.log("show the token " + JSON.stringify(zertifikat))
        http.post("/api/post", zertifikat).then((res) => {
            //verify whether token is accept
            if (res.data.status === 'login') { 
                //status is log-in
                //add data to back
                if (this.state.dateCreated === null) {
                    alert('please at least choose a date')
                } else {
                    const uploadArray = [
                        {
                            "applicant": localStorage.getItem('user'),
                            "title": this.state.titleAdd,
                            "video": this.state.videoUrlAdd,
                            "imag": this.state.imgUrlAdd,
                            "location":this.state.locationAdd,
                            "description": this.state.descriptionAdd,
                            "website": this.state.officialSiteAdd,
                            "date": this.state.dateCreated,
                            "remark": this.state.additionalText
                        },
                        { "contract": this.state.joinVertrag }
                    ]
                    http.post("/addData", uploadArray).then((res) => {
                        if (res.data.status === "fail") {
                            this.setState({ title: `Sorry, there is some error: ${res.data.err}`, joinVertrag: null })
                        } else {
                            this.setState({ title: `You have created Chartiy work: ${res.data.number}`, joinVertrag: null })
                        }
                    })
                }
            } else if (res.data.status === '400' || res.data.status === '401') {
                //token expire
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                alert("please log-in again")
                //jump to front
                window.location = `/`
            } else {
                alert("please log-in before creating and charity work")
                window.location = `/`
            }
        })
    }
    render () {
        let vertragList = this.state.loadKontoVertrag.map( c => {
            return(
                <Row className='center-object'>
                    <Col><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/id=${c.vertragnumer}`}}>{c.vertragtitel}</Button></Col>
                    <Col>{c.vertragnumer}</Col><Col>{c.vertragstatus}</Col>
                    <Col><Button outline color="link" onClick={() => {
                        this.setState({ 
                            joinVertrag: c.vertragnumer,
                            title: `You have selected contract ${c.vertragnumer} to this charity work` 
                        })
                        //this.beitreten()
                        }} size="sm">Join</Button></Col>
                </Row>
            )
        })
        return (
            <Container>
            <Row className="center-object">{this.state.title}</Row>
            <hr />
            <Form>
                <FormGroup row>
                    <Label sm={3}>Applicant</Label>
                    <Col sm={8} className="text-trademakr-infor">
                        <div className="center-text">{this.state.applicantAdd}</div>
                        {/*<Input type="text" 
                            onChange={(e) => this.setState({ applicantAdd: e.target.value })}/> */}
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Title</Label>
                    <Col sm={8}>
                        <Input type="text" 
                            onChange={(e) => this.setState({ titleAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Video Link</Label>
                    <Col sm={8}>
                        <Input type="text" 
                            onChange={(e) => this.setState({ videoUrlAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Image Link</Label>
                    <Col sm={8}>
                        <Input type="text" 
                            onChange={(e) => this.setState({ imgUrlAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Location</Label>
                    <Col sm={8}>
                        <Input type="text" 
                            onChange={(e) => this.setState({ locationAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Description</Label>
                    <Col sm={8}>
                        <Input type="textarea" 
                            onChange={(e) => this.setState({ descriptionAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Official Site</Label>
                    <Col sm={8}>
                        <Input type="text" 
                            onChange={(e) => this.setState({ officialSiteAdd: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Date Created</Label>
                    <Col sm={8}>
                        <Input type="date" 
                            placeholder="select date"
                            onChange={(e) => this.setState({ dateCreated: e.target.value })}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label sm={3}>Additional Information</Label>
                    <Col sm={8}>
                        <Input type="textarea" 
                            onChange={(e) => this.setState({ additionalText: e.target.value })}/>
                    </Col>
                </FormGroup>
            </Form>
            <br />
            <Row className="center-object" sm={6}>
                {/*<Button type="submit" outline color="primary" onClick={() => this.setState({ showContractList: !this.state.showContractList })}>Adopt Contracts</Button>*/}
                {this.state.joinVertrag === null && <Button type="submit" outline color="primary" onClick={e => this.schaffen(e)}>Create</Button>}
                {this.state.joinVertrag !== null && <Button type="submit" color="primary" onClick={e => this.schaffen(e)}>Create Charity Work</Button>}
            </Row>
            {this.state.showContractList === true && 
            <div>
                <br />
                <Alert color="secondary"><Row><Col>Choose the contract to link the charity work</Col><Col sm={2}><Button color="warning" size="sm" onClick={() => {window.location = `/blankvertrag/id=${this.props.match.params.vertragnumer}`}}>Generate new Contract</Button></Col></Row></Alert>
                <div>
                <br />
                <Row className='center-object'>
                    <Col className="text-trademakr-infor">Contract Title</Col><Col className="text-trademakr-infor">Contract Number</Col><Col className="text-trademakr-infor">Status</Col><Col className="text-trademakr-infor">Join by the contract</Col>
                </Row>
                <br />
                {vertragList}
            </div>
            </div>}
            </Container>
        )
    }
}

export default Add;