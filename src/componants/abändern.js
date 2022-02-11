import React, { Component } from "react";
import { Container, Row, Button } from "reactstrap";
import './gesichtEin.css'
import http from './http-axios'
import ReactPlayer from 'react-player';

class Abändern extends Component {
    constructor () {
        super ();
        this.state = {
            fallTitel: null, //project title
            fallNumer: null, //project number
            applicant: null,
            videoUrl: null,
            location: null,
            description: null,
            website: null,
            dateCreated: null,
            insitution: null,
            remark: "No additional Information",


            occupationnumer: null,

            showContract: false, //show the available contracts
            loadKontoVertrag: [], //load the current contract of users from back
            loadProjectVertrag: [],

            joinVertrag: null //the contract joinging charity work
        }
        this.verwenden = this.verwenden.bind(this) //show the list of contract to sign
        this.beitreten = this.beitreten.bind(this) //join charity work by contract
    }
    componentDidMount () {
        //show data to anyone
        http.get(`/hauptsachlich/id=${this.props.match.params.aussortierenData}`).then(res => {
            //const einfuhr = res.data.filter((items) => items.geschichte === this.props.match.params.aussortierenData )
            this.setState({ 
                fallTitel: res.data.eachPage.titel,
                applicant: res.data.eachPage.antragsteller,
                fallNumer: res.data.eachPage.projectnumer,
                videoUrl: res.data.eachPage.video,
                location: res.data.eachPage.ort,
                description: res.data.eachPage.beschreibung,
                website: res.data.eachPage.website,
                dateCreated: res.data.eachPage.datem,
                insitution: res.data.eachPage.insitution,

                occupationnumer: res.data.occupation.occupationnumer
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
                this.setState({ showContract: !this.state.showContract })
                http.post(`/hauptsachlich/id=${this.props.match.params.aussortierenData}`, {"user": localStorage.getItem('user')}).then((res) => {
                    this.setState({ 
                        loadKontoVertrag: res.data.alleskonto,
                        loadProjectVertrag: res.data.projectVertrag
                    })
                })
            } else if (res.data.status === '400' || res.data.status === '401') {
                //token expire
                this.setState({ showContract: !this.state.showContract })
                http.post(`/hauptsachlich/id=${this.props.match.params.aussortierenData}`, {"user": "None"}).then((res) => {
                    if (res.data.status === "empty") {
                        this.setState({ loadKontoVertrag: [], loadProjectVertrag: [] })
                    } else {
                        this.setState({ 
                            loadKontoVertrag: res.data.alleskonto,
                            loadProjectVertrag: res.data.projectVertrag
                        })
                    }
                })
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            } else {
                this.setState({ showContract: !this.state.showContract })
                http.post(`/hauptsachlich/id=${this.props.match.params.aussortierenData}`, {"user": "None"}).then((res) => {
                    if (res.data.status === "empty") {
                        this.setState({ loadKontoVertrag: [], loadProjectVertrag: [] })
                    } else {
                        this.setState({ 
                            loadKontoVertrag: res.data.alleskonto,
                            loadProjectVertrag: res.data.projectVertrag
                        })
                    }
                })
            }
        })
    }
    beitreten () {
        if (window.confirm(`Are you sure you want to join this Project ${this.state.fallNumer} by this contract?`)) {
            //join charity work by contract
            http.post(`/hauptsachlich/id=${this.props.match.params.aussortierenData}/join`, {"contract": this.state.joinVertrag}).then((res) => {
                if (res.data.status === "success") {
                    alert(`You choose contract ${this.state.joinVertrag} to join the Collaboration ${this.state.fallNumer}`)
                }
            })
        }
    }
    render () {
        let projectVertrag = this.state.loadProjectVertrag.map( other => {
            return(
                <tr>
                    <td><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/jedes/id=${other.abkommennumer}`}}>{other.abkommennumer}</Button></td>
                    <td>{other.titel}</td>
                    <td>{other.creatzeit}</td>
                    <td>{other.creator}</td>
                    <td>{other.vertragstatus}</td>
                </tr>
            )
        })
        let kontoVertrag = this.state.loadKontoVertrag.map( c => {
            return(
                <tr>
                    <td><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/jedes/id=${c.abkommennumer}`}}>{c.abkommennumer}</Button></td>
                    <td>{c.titel}</td>
                    <td>{c.creatzeit}</td>
                    <td>{c.vertragstatus}</td>
                    <td><Button outline color="link" onClick={() => {
                        this.setState({ joinVertrag: c.abkommennumer })
                        this.beitreten()
                        }} size="sm">Join</Button></td>
                </tr>
            )
        })
        return (
            <Container>
            <div className="making-row separate-two-side">
                <div>Project Title: <h3>{this.state.fallTitel}</h3></div>
                {localStorage.getItem('user') === this.state.applicant && <div><button className="toggle" onClick={() => {window.location = `/editData/project=${this.state.fallNumer}`}}>Edit</button></div>}
            </div>
            <br />
            <div className="making-row separate-two-side">
                {this.state.videoUrl !== null && 
                <div className="block-project block-brief-project">
                    <div className="block-zweite-project-container">
                        <div className="text-row-height">Description</div>
                        <div className="text-trademakr-infor">{this.state.description}</div>
                    </div>
                </div>}
                <div className="block-project block-video-project">
                    <div className="block-erste-project-container">
                    {this.state.videoUrl !== null && 
                        <Row className='center-object'>
                        <ReactPlayer
                            key={this.state.fallNumer}
                            className="player-itself"
                            url= {this.state.videoUrl}
                            width='480px'
                            height='270px'
                            muted = 'true'
                            />
                        </Row>}
                    {this.state.videoUrl === null && 
                    <div>
                        <div className="text-row-height">Description</div>
                        <div className="text-trademakr-infor">{this.state.description}</div>
                    </div>}
                    </div>
                </div>
                <div className="block-project block-infor-project">
                    <div className="block-erste-project-container">
                        <div className="making-row text-row-height">
                            <div>Project Number:</div>
                            <div className="text-trademakr-infor text-left-gap">{this.state.fallNumer}</div>
                        </div>
                        <div className="making-row text-row-height">
                            <div>Planned Date:</div>
                            <div className="text-trademakr-infor text-left-gap">{this.state.dateCreated}</div>
                        </div>
                        <div className="making-row text-row-height">
                            <div>Created by:</div>
                            {this.state.occupationnumer !== null && <div className="text-trademakr-infor text-left-gap text-pointer"
                                onClick={() => {window.location = `/mitglieduberprufung/id=${this.state.occupationnumer}`}}
                                >{this.state.applicant}</div>}
                                {this.state.occupationnumer === null && <div className="text-trademakr-infor text-left-gap">{this.state.applicant}</div>}
                        </div>
                        <div className="making-row text-row-height">
                            <div>Location:</div>
                            <div className="text-trademakr-infor text-left-gap">{this.state.location}</div>
                        </div>
                        <div className="making-row text-row-height">
                            <div>Website:</div>
                            <div className="text-trademakr-infor text-left-gap">{this.state.website === null && <div>No Website</div>}{this.state.website !== null && <a href={this.state.website}>Click</a>}</div>
                        </div>
                        <div className="making-row text-row-height">
                            <div>Insitution</div>
                            <div className="text-trademakr-infor text-left-gap">{this.state.insitution === null && <div>No Institution Support</div>}{this.state.insitution !== null && <div>{this.state.insitution}</div>}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="width-control-sieben center-object">
                <hr />
                <div className="center-text text-pointer" onClick={() => this.verwenden()}>Show the Contracts</div>
                <br />
                {this.state.showContract === true && this.state.loadKontoVertrag.length === 0  && this.state.loadProjectVertrag.length === 0 &&
                <div className="center-text">There is no open Contracts here</div>}
                {this.state.showContract === true && this.state.loadProjectVertrag.length > 0 &&
                <div>
                    <table id="contract-list">
                        <tr>
                            <th>Contract Number</th>
                            <th>Contract Name</th>
                            <th>Created Time</th>
                            <th>Created by</th>
                            <th>Status</th>
                        </tr>
                        {projectVertrag}
                    </table>
                    <br />
                </div>}
                {this.state.showContract === true && this.state.loadKontoVertrag.length > 0 &&
                <div>
                <br />
                    <div className="center-text">Your Contracts</div>
                    <table id="contract-list">
                        <tr>
                            <th>Contract Number</th>
                            <th>Contract Name</th>
                            <th>Created Time</th>
                            <th>Status</th>
                            <th>Use/Join</th>
                        </tr>
                        {kontoVertrag}
                    </table>
                </div>}
            </div>
            </Container>
        )
    }
}


export default Abändern;