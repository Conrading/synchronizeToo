import React, { Component } from "react";
import './haupts.css'
import { Container } from 'reactstrap'
import http from './http-axios'
import ReactPlayer from 'react-player';


class Hauptsächlich extends Component {
    constructor () {
        super ();
        this.state = {
            projectSearch: null,
            searchResult: null,

            importDefualtList: {
                "firstLine": [],
                "secondLine": [],
                "thridLine": [],
                "vierLine": []
            } 
        }
        //sort out how to present data
        this.sortOutData = this.sortOutData.bind(this) //sort out the data user wants to present
        //sort out how to present data
        //add another trademark
        this.resetAll = this.resetAll.bind(this) //reset variable after sort data
    }
    componentDidMount () {
        //show data without log-in
        http.get("/hauptsachlich").then(res => {
            this.setState({ importDefualtList: res.data })
        }) 
    }
    sortOutData () {
        //lower case of applicant
        if (this.state.projectSearch == null) {
            this.setState({ searchResult: "Please input something before search" })
        } else { 
            this.setState({ searchResult: null })
        }
        //submit the data sort out critaria
        http.post("/searchproject", {search: this.state.projectSearch.replace(/\W+/g, '-').toLowerCase()}).then((res) => {
           if (res.data.negative === "empty") {
               this.setState({ searchResult: "Search no result" })
            } else if (res.data.negative === "error") {
                this.setState({ searchResult: res.data.error })
            } else {
                let array = []
                for (let i = 0; i < res.data.applicant.length; i++) {
                    array.push(res.data.applicant[i])
                }
                for (let j = 0; j < res.data.title.length; j++) {
                    array.push(res.data.title[j])
                }
                for (let k = 0; k < res.data.beschreibung.length; k++) {
                    array.push(res.data.beschreibung[k])
                }
                console.log("alright: " + JSON.stringify(res.data))
                this.setState({ searchResult: null, importDefualtList: array })
            } 
        })
    }
    resetAll () {
        //set several variable to defualt
    }
    render () {
        let erstenCard = this.state.importDefualtList.firstLine.map( i => {
            let title = i.titel
            if (i.titel.length > 37) {title = title.substring(0,37) + " ..."}
            let description = i.beschreibung
            if (i.beschreibung.length > 137) {description = description.substring(0, 137) + " ..."}
            return (
                <div className='card-project'>
                    <div className='up-gap'>
                        {i.imag !== null &&
                        <img top height="100px" width="100px" class="center"
                            src={i.imag}
                            alt="no trademark image" />}
                        {i.video !== null &&
                        <ReactPlayer
                            key={i.projectnumer}
                            className="player-itself"
                            url= {i.video}
                            width='291px'
                            height='150px'
                            muted = 'true'
                            />}
                        {i.video === null &&
                        <div className="container limit-height-117px">
                            <div className="text-trademakr-infor">{description}</div>
                        </div>}
                    </div>
                    <div className="limit-width-sieben center-object"><hr /></div>
                    <div className="container">
                        <div className="making-row text-row-height">
                            <div className="text-pointer text-left-gap" onClick={() => {window.location = `/hauptsachlich/id=${i.projectnumer}`}}><b>{title}</b></div>
                        </div>
                        <div className="zweite-infor">
                            <div className="text-left-gap" >Created by {i.antragsteller}</div>
                        </div>
                    </div>
                </div>
            )
        })
        let zweitenCard = this.state.importDefualtList.secondLine.map( i => {
            let title = i.titel
            if (i.titel.length > 37) {title = title.substring(0,37) + " ..."}
            let description = i.beschreibung
            if (i.beschreibung.length > 137) {description = description.substring(0, 137) + " ..."}
            return (
                <div className='card-project'>
                    <div className='up-gap'>
                        {i.imag !== null &&
                        <img top height="100px" width="100px" class="center"
                            src={i.imag}
                            alt="no trademark image" />}
                        {i.video !== null &&
                        <ReactPlayer
                            key={i.projectnumer}
                            className="player-itself"
                            url= {i.video}
                            width='291px'
                            height='150px'
                            muted = 'true'
                            />}
                        {i.video === null &&
                        <div className="container limit-height-117px">
                            <div className="text-trademakr-infor">{description}</div>
                        </div>}
                    </div>
                    <div className="limit-width-sieben center-object"><hr /></div>
                    <div className="container">
                        <div className="making-row text-row-height">
                            <div className="text-pointer text-left-gap" onClick={() => {window.location = `/hauptsachlich/id=${i.projectnumer}`}}><b>{title}</b></div>
                        </div>
                        <div className="zweite-infor">
                            <div className="text-left-gap" >Created by {i.antragsteller}</div>
                        </div>
                    </div>
                </div>
            )
        })
        let dreiCard = this.state.importDefualtList.thridLine.map( i => {
            let title = i.titel
            if (i.titel.length > 37) {title = title.substring(0,37) + " ..."}
            let description = i.beschreibung
            if (i.beschreibung.length > 137) {description = description.substring(0, 137) + " ..."}
            return (
                <div className='card-project'>
                    <div className='up-gap'>
                        {i.imag !== null &&
                        <img top height="100px" width="100px" class="center"
                            src={i.imag}
                            alt="no trademark image" />}
                        {i.video !== null &&
                        <ReactPlayer
                            key={i.projectnumer}
                            className="player-itself"
                            url= {i.video}
                            width='291px'
                            height='150px'
                            muted = 'true'
                            />}
                        {i.video === null &&
                        <div className="container limit-height-117px">
                            <div className="text-trademakr-infor">{description}</div>
                        </div>}
                    </div>
                    <div className="limit-width-sieben center-object"><hr /></div>
                    <div className="container">
                        <div className="making-row text-row-height">
                            <div className="text-pointer text-left-gap" onClick={() => {window.location = `/hauptsachlich/id=${i.projectnumer}`}}><b>{title}</b></div>
                        </div>
                        <div className="zweite-infor">
                            <div className="text-left-gap" >Created by {i.antragsteller}</div>
                        </div>
                    </div>
                </div>
            )
        })
        let vierCard = this.state.importDefualtList.vierLine.map( i => {
            let title = i.titel
            if (i.titel.length > 37) {title = title.substring(0,37) + " ..."}
            let description = i.beschreibung
            if (i.beschreibung.length > 137) {description = description.substring(0, 137) + " ..."}
            return (
                <div className='card-project'>
                    <div className='up-gap'>
                        {i.imag !== null &&
                        <img top height="100px" width="100px" class="center"
                            src={i.imag}
                            alt="no trademark image" />}
                        {i.video !== null &&
                        <ReactPlayer
                            key={i.projectnumer}
                            className="player-itself"
                            url= {i.video}
                            width='291px'
                            height='150px'
                            muted = 'true'
                            />}
                        {i.video === null &&
                        <div className="container limit-height-117px">
                            <div className="text-trademakr-infor">{description}</div>
                        </div>}
                    </div>
                    <div className="limit-width-sieben center-object"><hr /></div>
                    <div className="container">
                        <div className="making-row text-row-height">
                            <div className="text-pointer text-left-gap" onClick={() => {window.location = `/hauptsachlich/id=${i.projectnumer}`}}><b>{title}</b></div>
                        </div>
                        <div className="zweite-infor">
                            <div className="text-left-gap" >Created by {i.antragsteller}</div>
                        </div>
                    </div>
                </div>
            )
        })
        return (
            <Container>
                <div className="searchbar">
                    <div className="searchbar-input"><input className="input-project" type="text" placeholder="search project" onChange={(e) => {this.setState({projectSearch: e.target.value})}}/></div>
                    <div className="searchbar-button" ><button className="search" onClick={() => {this.sortOutData()}}>Search</button></div>
                </div>
                {this.state.searchResult !== null && <div><br /><div className="center-text">{this.state.searchResult}</div></div>}
                <br />
                <div className="making-row">
                    <div className="width-column">{erstenCard}</div>
                    <div className="width-column">{zweitenCard}</div>
                    <div className="width-column">{dreiCard}</div>
                    <div className="width-column">{vierCard}</div>
                </div>
            </Container>
        )
    }
}

export default Hauptsächlich;
