import React, { Component } from "react";
import './mitglied.css'
import './gesichtEin.css'
import { Container, Row, Button } from 'reactstrap'
import http from './http-axios'
import mitgliedSprach from '../sprache/mitgliedSprach'


class Mitglied extends Component {
    constructor () {
        super ();
        this.state = {
            showProject: false,
            showContract: true,
            showPersonalInfor: false,
            showQuotation: false,

            amountVertrag: null,
            amountproject: null,
            loadProject: [],
            abkommenupdaten: [],
            occupationconfirmation: [],

            invitationStatus: false,

            //personal information
            google: null,
            verified: false,
            wirklichname: null,
            email: null,
            phone: null,
            ort: null,
            sprache: null,

            occupationnumer: null,
            firm: null,
            scope: null,
            field: null,
            title: null,

            photo: null,
            website: null,
            social: null,

            brief: [],
            experience: [],
            education: [],
            quotation: [],

            sprachsetting: 0
        }
        this.sabmeldung = this.abmeldung.bind(this)
    }
    componentDidMount () {
        const zertifikat = {"token": localStorage.getItem('token')}
        http.post("/api/post", zertifikat).then((res) => {
            //verify whether token is accept
            if (res.data.status === 'login') { 
                //log-in success
                http.post("/getlanguage", {"user": localStorage.getItem('user')}).then(res => {
                    if (res.data.status === "success") {
                        this.setState({ sprachsetting: res.data.sprache })
                    } 
                })
                //import account contract and charity 
                http.post("/mitglied/id=:kontoname", {"user": localStorage.getItem('user')}).then((res) => {
                    //load charity and contract
                    this.setState({ 
                        amountVertrag: res.data.vertragLength, 
                        amountproject: res.data.projectLength,
                        loadProject: res.data.project,
                        abkommenupdaten: res.data.abkommenupdaten,
                        occupationconfirmation: res.data.occupationconfirmation
                    })
                })
                http.post("/personalinform", {"user": localStorage.getItem('user')}).then(res => {
                    const importDefualtList = res.data 
                    if (importDefualtList.authentisch.length > 0) {
                        this.setState({ 
                            google: importDefualtList.authentisch[0].google,
                            verified: importDefualtList.authentisch[0].verified,
                            wirklichname: importDefualtList.authentisch[0].wirklichname,
                            email: importDefualtList.authentisch[0].email,
                            phone: importDefualtList.authentisch[0].phone,
                            ort: importDefualtList.authentisch[0].ort,
                            sprache: importDefualtList.authentisch[0].sprache,
                        })
                    }
                    if (importDefualtList.veranderlich.length > 0) {
                        this.setState({ 
                            photo: importDefualtList.veranderlich[0].photo,
                            website: importDefualtList.veranderlich[0].website,
                            social: importDefualtList.veranderlich[0].social
                        })
                    }
                    if (importDefualtList.occupation.length > 0) {
                        this.setState({ 
                            occupationnumer: importDefualtList.occupation[0].occupationnumer,
                            firm: importDefualtList.occupation[0].firm,
                            scope: importDefualtList.occupation[0].scope,
                            field: importDefualtList.occupation[0].field,
                            title: importDefualtList.occupation[0].title,
                        })
                    }
                    if (importDefualtList.brief.length > 0) {
                        if (importDefualtList.brief[0].brief !== null) {
                            let briefy = importDefualtList.brief[0].brief.split(/\r?\n/)
                            this.setState({ brief: briefy })
                        }
                        if (importDefualtList.brief[0].experience !== null) {
                            let expe = importDefualtList.brief[0].experience.split(/\r?\n/)
                            this.setState({ experience: expe })
                        }
                        if (importDefualtList.brief[0].education !== null) {
                            let educ = importDefualtList.brief[0].education.split(/\r?\n/)
                            this.setState({ education: educ })
                        }
                        if (importDefualtList.brief[0].quotation !== null) {
                            let quote = importDefualtList.brief[0].quotation.split(/\r?\n/)
                            this.setState({ quotation: quote })
                        }
                    }
                }) 
            } else if (res.data.status === "invitationCodeRequest") {
                this.setState({ invitationStatus: true })
                http.post("/mitglied/id=:kontoname", {"user": localStorage.getItem('user')}).then((res) => {
                    this.setState({ 
                        amountVertrag: res.data.vertragLength, 
                        amountproject: null,
                        loadProject: [{"projectnumer": null, "titel": null, "datem": null}],
                        abkommenupdaten: res.data.abkommenupdaten,
                        occupationconfirmation: res.data.occupationconfirmation
                    })
                })
            } else if (res.data.status === '400' || res.data.status === '401') {
                //token expire
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                //jump to front
                window.location = `/anmeldung`
            } else {
                window.location = `/anmeldung`
            }
        })
    }
    abmeldung () {
        if (window.confirm("Are you sure you want to lot-out?")) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location = `/anmeldung`
        }
    }
    render () {
        let vertragList = this.state.abkommenupdaten.map( c => {
            return(
                <tr>
                    <td><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/jedes/id=${c.abkommennumer}`}}>{c.abkommennumer}</Button></td>
                    <td>{c.creator}</td>
                    <td>{c.titel}</td>
                    <td>{c.vertragstatus}</td>
                    <td>{c.updatetag}</td>
                    <td>{c.updatenby}</td>
                </tr>
            )
        })
        let occupation = this.state.occupationconfirmation.map( o => {
            if (this.state.occupationconfirmation.length > 0) {
                return(
                    <tr>
                        <td><Button outline color="link" size="sm" onClick={() => {window.location = `/vertrag/${localStorage.getItem('user')}/id=${o.abkommennumer}`}}>{o.abkommennumer}</Button></td>
                        <td>{o.creator}</td>
                        <td>{o.titel}</td>
                        <td>{o.vertragstatus}</td>
                    </tr>
                )
            }
        })
        let projectList = this.state.loadProject.map( s => {
            return(
                <tr>
                    <td><Button outline color="link" size="sm" onClick={() => {window.location = `/hauptsachlich/id=${s.projectnumer}`}}>{s.projectnumer}</Button></td>
                    <td>{s.titel}</td>
                    <td>{s.datem}</td>
                </tr>
            )
        })
        let briefList = this.state.brief.map (b => {
            return(
                <div>{b}</div>
            )
        })
        let experienceList = this.state.experience.map( x => {
            return(
                <div>{x}</div>
            )
        })
        let educationList = this.state.education.map( e => {
            return(
                <div>{e}</div>
            )
        })
        let quotationlist = this.state.quotation.map( q => {
            return(
                <div>{q}</div>
            )
        })
        return (
            <Container>
            <br />
            <div className="personal-upper center-object">
                <div className="personal-upper-left">
                    {this.state.photo === null && <div><img top height="100px" width="100px" class="center"
                        src="https://miro.medium.com/max/1400/1*N5w9Ay0VlQBKF4b11C0LdQ.png"
                        alt="no account image" /></div>}
                    {this.state.photo !== null && <div><img top height="100px" width="100px" class="center"
                        src={this.state.photo}
                        alt="no account image" /></div>}
                </div>
                <div className="personal-upper-right">
                    <div className="personal-left-gap making-row personal-upper-right-gap">
                        {localStorage.getItem('user') !== null && this.state.invitationStatus === true && <b>{localStorage.getItem('user').toUpperCase()}</b>}
                        {localStorage.getItem('user') !== null && this.state.invitationStatus === false && 
                        <div className="text-pointer" onClick={() => {window.location = `/mitgliedinformation/id=${localStorage.getItem('user')}`}}>
                            <b>{localStorage.getItem('user').toUpperCase()}</b>
                        </div>}
                        <button className="logout" onClick={() => {this.abmeldung()}}>{mitgliedSprach[this.state.sprachsetting].logout}</button>
                        {this.state.verified === true && <div className="making-row"><img top height="21px" width="21px" class="center"
                        src="https://www.myusfra.org/images/1.3_1.png"
                        alt="no verified image" /><b>verified!</b></div>}
                    </div>
                    <div className="personal-left-gap personal-upper-right-gap-second">
                        <button className="personal" onClick={() => this.setState({ showProject: true, showContract: false, showPersonalInfor: false })}>
                        {mitgliedSprach[this.state.sprachsetting].projektAmount}: <b>{this.state.amountproject}</b>
                        </button>
                        <button className="personal" onClick={() => this.setState({ showProject: false, showContract: true, showPersonalInfor: false })}>
                        {mitgliedSprach[this.state.sprachsetting].contractAmount}: <b>{this.state.amountVertrag}</b>
                        </button>
                        <button className="personal" onClick={() => this.setState({ showProject: false, showContract: false, showPersonalInfor: true })}>
                        {mitgliedSprach[this.state.sprachsetting].personalInformation}
                        </button>
                    </div>
                </div>
            </div>
            {this.state.showProject === true && 
            <div className="center-object personal-bottom">
                <hr />
                <div className="center-button">
                <button className="create" onClick={() => {
                        if (!localStorage.getItem('user')) {
                            //if currently not log in
                            window.location = '/'
                        } else {
                            window.location = `/addData/id=${localStorage.getItem('user')}`
                        }}}>{mitgliedSprach[this.state.sprachsetting].hinzufugenProjekt}</button>
                </div>
                <br />
                <table id="contract-list">
                    <tr>
                        <th>{mitgliedSprach[this.state.sprachsetting].projektNumer}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].projektTitel}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].erstelltZeit}</th>
                    </tr>
                    {projectList}
                </table>
            </div>}
            {this.state.showContract === true &&
            <div className="center-object personal-bottom">
                <hr />
                <div className="center-button">
                <button className="create" onClick={() => {window.location = `/vertrag/jedes/id=undefined`}}>{mitgliedSprach[this.state.sprachsetting].hinzufugenVertrag}</button>
                </div>
                <br />
                <table id="contract-list">
                    <tr>
                        <th>{mitgliedSprach[this.state.sprachsetting].vertragNumer}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].erstelltBei}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].vertragName}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].vertragstatus}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].letzteUpdaten}</th>
                        <th>{mitgliedSprach[this.state.sprachsetting].updatenBei}</th>
                    </tr>
                    {vertragList}
                </table>
                {this.state.occupationconfirmation.length > 0 &&
                <div>
                <br />
                    <div className="center-text">{mitgliedSprach[this.state.sprachsetting].dreitenParteiVertrag}</div>
                    <table id="contract-list">
                        <tr>
                            <th>{mitgliedSprach[this.state.sprachsetting].vertragNumer}</th>
                            <th>{mitgliedSprach[this.state.sprachsetting].erstelltBei}</th>
                            <th>{mitgliedSprach[this.state.sprachsetting].vertragName}</th>
                            <th>{mitgliedSprach[this.state.sprachsetting].vertragstatus}</th>
                        </tr>
                        {occupation}
                    </table>
                </div>}
            </div>}
            {this.state.showPersonalInfor === true && 
            <div className="center-object personal-bottom">
                <hr />
                <div className="main-title-flex">
                    <h4><b>{this.state.wirklichname}</b></h4>
                    <div  className="text-trademakr-infor">{mitgliedSprach[this.state.sprachsetting].berufNumer}: {this.state.occupationnumer}</div>
                </div>
                <div>{this.state.title}</div>
                <div className="main-title-flex">
                    <div className="information">
                        <div className="brief-container">
                            <table id="personal">
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].email}: </th>
                                    <td>{this.state.email}</td>
                                </tr>
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].ort}: </th>
                                    <td>{this.state.ort}</td>
                                </tr>
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].phone}: </th>
                                    <td>{this.state.phone}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div className="information">
                        <div className="brief-container">
                            <table id="personal">
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].sprach}:</th>
                                    <td>{this.state.sprache}</td>
                                </tr>
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].website}: </th>
                                    <td><a href={this.state.website}>Link</a></td>
                                </tr>
                                <tr>
                                    <th>{mitgliedSprach[this.state.sprachsetting].social}: </th>
                                    <td><a href={this.state.social}>{localStorage.getItem('user').toUpperCase()}</a></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div className="occupation">
                        <div className="occupation-personal-right">
                            <div>{mitgliedSprach[this.state.sprachsetting].firm}: <b>{this.state.firm}</b></div>
                            <div><b>{this.state.scope}</b></div>
                            <div>{this.state.field}</div>
                        </div>
                    </div>
                </div>
                <br />
                <Row>
                    <div className="brief">
                        <div className="brief-container">
                            <div className="intro">{mitgliedSprach[this.state.sprachsetting].intro}</div>
                            <p>{briefList}</p>
                        </div>
                    </div>
                    <div className="brief">
                        <div className="brief-container">
                            <div className="intro">{mitgliedSprach[this.state.sprachsetting].experience}</div>
                            <div>{experienceList}</div>
                        </div>
                    </div>
                    <div className="brief">
                        <div className="brief-container">
                            <div className="intro">{mitgliedSprach[this.state.sprachsetting].education}</div>
                            <div>{educationList}</div>
                        </div>
                    </div>
                    <div className="brief">
                        <div className="brief-container">
                            <div className="intro text-pointer" onClick={() => {this.setState({showQuotation: !this.state.showQuotation})}}>{mitgliedSprach[this.state.sprachsetting].quotation}</div>
                            {this.state.showQuotation === true && <div>{quotationlist}</div>}
                        </div>
                    </div>
                </Row>
            </div>}
            </Container>
        )
    }
}

export default Mitglied;
