import React, { Component } from "react";
import './mainPage.css'
import http from './http-axios'
import mainPageSprache from '../sprache/mainPageSprache.js'


class Main extends Component {
    constructor () {
        super ();
        this.state = {
            change: "0",
            salesLine: null,
            urlSwtiching: null,
            sprachsetting: 0,
        }
    }
    componentDidMount () {
        http.post("/getlanguage", {"user": localStorage.getItem('user')}).then(res => {
            if (res.data.status === "success") {
                this.setState({ sprachsetting: res.data.sprache })
            } 
        })
    }
    render () {
        return (
            <body>
            <div className="block-black">
                <div className="block-light-black-text"><span>{mainPageSprache[this.state.sprachsetting].connect}</span><span>{mainPageSprache[this.state.sprachsetting].ideas}</span></div>
            </div>
            <div className="block-second-layer">
                <div className="making-row moving-area">
                    <div className="moving-card" onClick={() => {
                        this.setState({ 
                            change: "1",
                            salesLine: mainPageSprache[this.state.sprachsetting].ideaSalesLine,
                            urlSwtiching: '/hauptsachlich'
                         })
                    }}>{mainPageSprache[this.state.sprachsetting].searchingIdea}</div>
                    <div className="moving-card" onClick={() => {
                        this.setState({ 
                            change: "1",
                            salesLine: mainPageSprache[this.state.sprachsetting].partnerSalesLine,
                            urlSwtiching: '/peoplesearch'
                         })
                    }}>{mainPageSprache[this.state.sprachsetting].seachingPartner}</div>
                    <div className="moving-card" onClick={() => {
                        this.setState({ 
                            change: "0",
                            salesLine: mainPageSprache[this.state.sprachsetting].contractSalesLine,
                            urlSwtiching: null
                         })
                    }}>{mainPageSprache[this.state.sprachsetting].contract}</div>
                </div>
                <div className="salesline-text gap-between-block-show">{this.state.salesLine}</div>
                {this.state.change !== "0" && <div className="more-customized-button" onClick={() => {window.location = this.state.urlSwtiching}}>{mainPageSprache[this.state.sprachsetting].moreButton}</div>}
            </div>
            </body>
        )
    }
}

export default Main;