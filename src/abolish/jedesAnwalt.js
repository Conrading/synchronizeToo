import React, { Component } from "react";
import { Container, Row, Col, Button, Alert } from "reactstrap";
import './gesichtEin.css'
import http from './http-axios'
import ReactPlayer from 'react-player';

class Jedesanwalt extends Component {
    constructor () {
        super ();
        this.state = {
            anwaltNumer: null, //attorney number
            anwaltTitel: null, //attorney title
            firm: null,
            imgUrl: null,
            videoUrl: null,
            location: null,
            description: null,
            website: null,
            dateCreated: null,
            remark: "No additional Information",


            datenbank: [], //import trademark infor

            showlöschen: false,
            vertragAlert: null, //show the contract status
            showContract: false, //show the available contracts
            loadKontoVertrag: [], //load the current contract of users from back

            joinVertrag: null //the contract number that is selected
        }
        this.verwenden = this.verwenden.bind(this) //show the list of contract to sign
        this.beitreten = this.beitreten.bind(this) //join charity work by contract
    }
    componentDidMount () {
        //show data to anyone
        http.get(`/attorney/id=${this.props.match.params.attorneynumer}`).then(res => {
            console.log(res.data.attorneyInfor)
            this.setState({ datenbank: res.data.attorneyInfor })
            this.setState({ 
                anwaltNumer: this.state.datenbank[0].attorneynumer,
                anwaltTitel: this.state.datenbank[0].titel,
                imgUrl: this.state.datenbank[0].imag,
                videoUrl: this.state.datenbank[0].video,
                location: this.state.datenbank[0].ort,
                description: this.state.datenbank[0].beschreibung,
                website: this.state.datenbank[0].website,
                dateCreated: this.state.datenbank[0].datem,
                remark: this.state.datenbank[0].geschichte
            })
        })
    }
    verwenden () {
        //show the list of contract to sign

        //get token certificate
        //get token from localstorage
        //but couldn't confirm token expire
        const zertifikat = {"token": localStorage.getItem('token')}
        http.post("/api/post", zertifikat).then((res) => {
            //verify whether token is accept
            if (res.data.status === 'login') { 
                //user has logged in
                //load the contract of this Stiftung and users
                this.setState({ showContract: !this.state.showContract, showlöschen: false })
                http.post(`/attorney-get-user-contract`, {"user": localStorage.getItem('user')}).then((res) => {
                    //separate if there is no contract from users or charity work
                    if (res.data.userContract.length === 0) {
                        //no contracts yet
                        this.setState({ vertragAlert: "Currently no contract generated yet !" })
                    } else {
                        this.setState({ loadKontoVertrag: res.data.userContract })
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
    beitreten () {
        //Either party ask for confirmation
        if (window.confirm(`You want to ask Attorney ${this.state.anwaltTitel} to manage this contract ${this.state.joinVertrag}?`)) {
            //join charity work by contract
            http.post(`/attorney/id=${this.props.match.params.attorneynumer}/join`, {
                "abkommennumer": this.state.joinVertrag, 
                "attorneynumer": this.state.anwaltNumer
            }).then((res) => {
                if (res.data.status === "success") {
                    //stay on the same page
                    this.setState( {vertragAlert: `You choose contract ${this.state.joinVertrag}`} )
                }
            })
        }
        //we need attorney confirmation flow
        //identify attorney ID
    }
    render () {
        let vertragList = this.state.loadKontoVertrag.map( c => {
            return(
                <Row className='center-object'>
                    <Col><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/${localStorage.getItem('user')}/id=${c.abkommennumer}`}}>{c.abkommennumer}</Button>
                    </Col><Col>{c.creator}</Col><Col>{c.creatzeit}</Col><Col>{c.titel}</Col><Col>{c.vertragstatus}</Col>
                    <Col><Button outline color="link" onClick={() => {
                        this.setState({ joinVertrag: c.abkommennumer })
                        this.beitreten()
                        }} size="sm">Send</Button></Col>
                </Row>
            )
        })
        return (
            <Container>
            {this.state.vertragAlert !== null && <Row><Alert>{this.state.vertragAlert}</Alert></Row>}
            <Row><div>Attorney: </div><h3>{this.state.anwaltTitel}</h3></Row>
            <Row className="object-right">Attorney Number: {this.state.anwaltNumer}</Row>
            <br />
            <Row>
                <Col sm={5}>
                    <Row className='center-object'>
                        {this.state.imgUrl !== null &&
                        <img top height="100px" width="100px" class="center"
                                src={this.state.imgUrl}
                                alt="no image" />}
                        {this.state.videoUrl !== null &&
                        <ReactPlayer
                            key={this.state.fallNumer}
                            className="player-itself"
                            url= {this.state.videoUrl}
                            width='480px'
                            height='270px'
                            muted = 'true'
                            />}
                    </Row>
                </Col>
                <Col>
                    <Row className="center-object">
                        <Col sm={2}>Created Date:</Col>
                        <Col sm={5} className="text-trademakr-infor">{this.state.dateCreated}</Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={2}>Location:</Col>
                        <Col sm={5} className="text-trademakr-infor">{this.state.location}</Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={2}>Desription:</Col>
                        <Col sm={5} className="text-trademakr-infor">{this.state.description}</Col>
                    </Row>
                    <Row className="center-object">
                        <Col sm={2}>Website:</Col>
                        <Col sm={5} className="text-trademakr-infor">{this.state.website === null && <div>No Website</div>}{this.state.website !== null && <a href={this.state.website}>Click</a>}</Col>
                    </Row>
                </Col>
            </Row>
            <br />
            <Row className="center-object">---------------------------------------</Row>
            <br />
            <Row className="center-object">Option</Row>
            <br />
            <Row>
                <Col><Button outline color="primary" onClick={() => this.verwenden()}>See the Contract List</Button></Col>
                <Col sm={2} className="object-right"><Button color="dark" onClick={() => {
                    this.setState({ showlöschen: !this.state.showlöschen, showContract: false })
                    }}>Additional Information</Button></Col>
            </Row>
            <br />
            {this.state.showlöschen === true && <div><br /><Row className="center-object">{this.state.remark}</Row></div>}
            {this.state.showContract === true &&
            <div>
                <br />
                <Alert>{this.state.vertragAlert}</Alert>
                <Row className='center-object'>
                    <Col className="text-trademakr-infor">Contract Number</Col><Col className="text-trademakr-infor">Created by</Col><Col className="text-trademakr-infor">Created Time</Col><Col className="text-trademakr-infor">Title</Col><Col className="text-trademakr-infor">Status</Col><Col className="text-trademakr-infor">Send to Attorney</Col>
                </Row>
                <br />
                {vertragList}
            </div>}
            </Container>
        )
    }
}


export default Jedesanwalt;