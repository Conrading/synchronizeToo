import React, { Component } from "react";
import './haupts.css'
import { Container } from 'reactstrap'
import http from './http-axios'


class Hauptsperson extends Component {
    constructor () {
        super ();
        this.state = {
            peopleSearch: null,
            searchResult: null,

            importDefualtList: {
                "firstLine": [],
                "secondLine": [],
                "thridLine": [],
            }
        }
        //sort out how to present data
        this.sortOutData = this.sortOutData.bind(this) //sort out the data user wants to present
    }
    componentDidMount () {
        //show data without log-in
        http.get("/hauptspeople").then(res => {
            this.setState({ importDefualtList: res.data })
        }) 
    }
    sortOutData () {
        //lower case of applicant
        if (this.state.peopleSearch == null) {
            this.setState({ searchResult: "Please input something before search" })
        } else { 
            this.setState({ searchResult: null })
        }
        //submit the data sort out critaria
        http.post("/searchpeople", {"search": this.state.peopleSearch.replace(/\W+/g, '-').toLowerCase()}).then((res) => {
           if (res.data.negative === "empty") {
               this.setState({ searchResult: "Search no result" })
            } else if (res.data.negative === "error") {
                this.setState({ searchResult: res.data.error })
            } else {
                this.setState({ importDefualtList: res.data.fulllist })
            } 
        })
    }
    render () {
        let erstenSplieler = this.state.importDefualtList.firstLine.map( i => {
            let field = i.field
            if (i.field !== null) {
                if (i.field.length > 37) {field = field.substring(0,37) + " ..."} 
            }
            return (
                <div className='personal-card'>
                    <div className="container">
                        <div className="card-background">
                            <div className="left-text text-left-gap title-up-gap">
                                <div className="text-pointer" onClick={() => {window.location = `/mitglieduberprufung/id=${i.occupationnumer}`}}><h4><b>{i.wirklichname}</b></h4></div>
                                <div>{i.scope}</div>
                                <div className="text-trademakr-infor">{field}</div>
                            </div>
                            <div className="personal-card-lower">
                                <div><b>{i.firm}</b></div>
                            </div>
                            <hr />
                        </div>
                    </div>
                </div>
            )
        })
        let zweiteSplieler = this.state.importDefualtList.secondLine.map( i => {
            let field = i.field
            if (i.field.length > 37) {field = field.substring(0,37) + " ..."} 
            return (
                <div className='personal-card'>
                    <div className="container">
                        <div className="card-background">
                            <div className="left-text text-left-gap title-up-gap">
                                <div className="text-pointer" onClick={() => {window.location = `/mitglieduberprufung/id=${i.occupationnumer}`}}><h4><b>{i.wirklichname}</b></h4></div>
                                <div>{i.scope}</div>
                                <div className="text-trademakr-infor">{field}</div>
                            </div>
                            <div className="personal-card-lower">
                                <div><b>{i.firm}</b></div>
                            </div>
                            <hr />
                        </div>
                    </div>
                </div>
            )
        })
        let dreiteSplieler = this.state.importDefualtList.thridLine.map( i => {
            let field = i.field
            if (i.field.length > 37) {field = field.substring(0,37) + " ..."} 
            return (
                <div className='personal-card'>
                    <div className="container">
                        <div className="card-background">
                            <div className="left-text text-left-gap title-up-gap">
                                <div className="text-pointer" onClick={() => {window.location = `/mitglieduberprufung/id=${i.occupationnumer}`}}><h4><b>{i.wirklichname}</b></h4></div>
                                <div>{i.scope}</div>
                                <div className="text-trademakr-infor">{field}</div>
                            </div>
                            <div className="personal-card-lower">
                                <div><b>{i.firm}</b></div>
                            </div>
                            <hr />
                        </div>
                    </div>
                </div>
            )
        })
        return (
            <Container>
                <div className="searchbar">
                    <div className="searchbar-input"><input className="input-project" type="text" placeholder="search people" onChange={(e) => {this.setState({peopleSearch: e.target.value})}}/></div>
                    <div className="searchbar-button" ><button className="search" onClick={() => {this.sortOutData()}}>Search</button></div>
                </div>
                <br />
                <div className="center-text">{this.state.searchResult}</div>
                {this.state.searchResult !== "Search no result" && 
                    <div className="making-row">
                        <div>{erstenSplieler}</div>
                        <div>{zweiteSplieler}</div>
                        <div>{dreiteSplieler}</div>
                    </div>}
            </Container>
        )
    }
}

export default Hauptsperson;
