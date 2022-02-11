import React, { Component } from "react";
import './mitglied.css'
import './gesichtEin.css'
import { Container } from 'reactstrap'
import http from './http-axios'
import mitgliedEditSprache from '../sprache/mitgliedEditSprache'


class MitgliedEdit extends Component {
    constructor () {
        super ();
        this.state = {
            kontonumer: null,
            konto: null,
            passwort: null,
            testpasswordEin: null,
            testpasswordZweite: null,

            google: null,
            verified: false,
            sprachsetting: "",
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

            brief: null,
            experience: null,
            education: null,
            quotation: null,

            importDefualtList: [], //import from defualt backend
            letterCheck: null,
            message: null,

            sprachsetting: 0,
        }
        //sort out how to present data
        this.updateData = this.updateData.bind(this) //sort out the data user wants to present
        this.passwordCheck = this.passwordCheck.bind(this)
    }
    componentDidMount () {
        //search konto, if no, then this is register page
        if (localStorage.getItem('user') == null) {
            var random = ''
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < 16; i++) {
                random += characters.charAt(Math.floor(Math.random() * charactersLength))
            }
            this.setState({ kontonumer: random })
        } else {
            this.setState({ konto: localStorage.getItem('user') })
            http.post("/personalinform", {"user": localStorage.getItem('user')}).then(res => {
                this.setState({ importDefualtList: res.data })
                this.setState({ kontonumer: res.data.kontonumer })
                if (this.state.importDefualtList.authentisch.length > 0) {
                    this.setState({ 
                        google: this.state.importDefualtList.authentisch[0].google,
                        verified: this.state.importDefualtList.authentisch[0].verified,
                        wirklichname: this.state.importDefualtList.authentisch[0].wirklichname,
                        email: this.state.importDefualtList.authentisch[0].email,
                        phone: this.state.importDefualtList.authentisch[0].phone,
                        ort: this.state.importDefualtList.authentisch[0].ort,
                        sprache: this.state.importDefualtList.authentisch[0].sprache,
                        verified: this.state.importDefualtList.authentisch[0].verified
                    })
                }
                if (this.state.importDefualtList.veranderlich.length > 0) {
                    this.setState({ 
                        photo: this.state.importDefualtList.veranderlich[0].photo,
                        website: this.state.importDefualtList.veranderlich[0].website,
                        social: this.state.importDefualtList.veranderlich[0].social
                    })
                }
                if (this.state.importDefualtList.occupation.length > 0) {
                    this.setState({ 
                        //occupationnumer: this.state.importDefualtList.occupation[0].occupationnumer,
                        firm: this.state.importDefualtList.occupation[0].firm,
                        scope: this.state.importDefualtList.occupation[0].scope,
                        field: this.state.importDefualtList.occupation[0].field,
                        title: this.state.importDefualtList.occupation[0].title,
                    })
                }
                if (this.state.importDefualtList.brief.length > 0) {
                    this.setState({ 
                        brief: this.state.importDefualtList.brief[0].brief,
                        experience: this.state.importDefualtList.brief[0].experience,
                        education: this.state.importDefualtList.brief[0].education,
                        quotation: this.state.importDefualtList.brief[0].quotation
                    })
                }
            }) 
            http.post("/getlanguage", {"user": localStorage.getItem('user')}).then(res => {
                if (res.data.status === "success") {
                    this.setState({ sprachsetting: res.data.sprache })
                } 
            })
        }
    }
    passwordCheck () {
        if (this.state.testpasswordEin !== null) {
            //let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
            //let symble = ["!", "@", "#", "$", "%", "&", "*", "/", "?", "+", "="]
            let letterCount = this.state.testpasswordEin.split('')
            let upperletter = /[A-Z]/g
            let numbers = /[0-9]/g
            if (this.state.testpasswordEin.match(upperletter) === null || this.state.testpasswordEin.match(numbers) === null || letterCount.length < 8) {
                this.setState({ letterCheck: "The Password should include at least one upper letter, numbers, and should be longer than 8 letters" })
            } else {this.setState({ letterCheck: null })}
        }
    }
    updateData () {
        let updateArray = {
            "kontonumer": this.state.kontonumer,
            "konto": this.state.konto,
            "passwort": this.state.passwort,

            //"google": this.state.google,
            //"verified": this.state.verified,
            "wirklichname": this.state.wirklichname,
            "email": this.state.email,
            "phone": this.state.phone,
            "ort": this.state.ort,
            "sprache": this.state.sprache,

            //"occupationnumer": this.state.occupationnumer,
            "firm": this.state.firm,
            "scope": this.state.scope,
            "field": this.state.field,
            "title": this.state.title,

            "photo": this.state.photo,
            "website": this.state.website,
            "social": this.state.social,

            "brief": this.state.brief,
            "experience": this.state.experience,
            "education": this.state.education,
            "quotation": this.state.quotation,
        }
        http.post("/languageswitch", {"sprache": this.state.sprachsetting, "user": localStorage.getItem('user')}).then(res => {
          if (res.data.status === "fail") {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location = '/hauptsachlich'
          } 
        })
        //submit the data sort out critaria
        http.post("/updatepersonalinfor", updateArray).then((res) => {
            if (res.data.status === "fail") {
                this.setState({ message: "System Error" })
            } else {window.location = `/mitglied/id=${localStorage.getItem('user')}`}
        })
    }
    render () {
        return (
            <Container>
                <div className="personal-upper">
                    <div>{mitgliedEditSprache[this.state.sprachsetting].kontoNumer}:</div>
                    <div><b className="text-left-gap">{this.state.kontonumer}</b></div>
                </div>
                {this.state.message !== null && <div>{this.state.message}</div>}
                <div className="center-object personal-upper">
                    <table id="accountinfor">
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].kontoName}:</td>
                            <th>
                    {localStorage.getItem('user') !== null && <div className="text-left-gap">{this.state.konto}</div>}
                    {localStorage.getItem('user') === null && <div className="text-left-gap"><input onChange={(e) => {this.setState({ konto: e.target.value })}}/></div>}
                            </th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].ändernPasswort}:</td>
                            <th>
                            <div className="text-left-gap">
                                <input className="input-project" type="password" onChange={(e) => {
                                    this.setState({ testpasswordEin: e.target.value })
                                    this.passwordCheck()}}/>
                            </div>
                            {this.state.letterCheck !== null && <div className="text-left-gap">{this.state.letterCheck}</div>}
                            {this.state.testpasswordEin !== null && <div className="text-left-gap">
                                <input className="input-project" type="password" placeholder="type same password again" onChange={(e) => {this.setState({ testpasswordZweite: e.target.value })}}/>
                            </div>}
                            {this.state.testpasswordEin === this.state.testpasswordZweite && (this.state.testpasswordEin !== null || this.state.testpasswordEin === "") && 
                            <div className="text-left-gap">{mitgliedEditSprache[this.state.sprachsetting].gleich}!</div>}
                            </th>
                        </tr>
                        {/*<tr>
                            <td>Google Account:</td>
                            <th>
                    <div className="first-row">{this.state.google}</div>
                    {this.state.google === null && <div className="first-row"><input className="input-project" type="text" onChange={(e) => {this.setState({ google: e.target.value })}}/></div>}
                            </th>
                        </tr>*/}
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].geprüftStatus}:</td>
                            <th>
                                {this.state.verified === true && <div className="text-left-gap">{mitgliedEditSprache[this.state.sprachsetting].geprüft}</div>}
                                {this.state.verified === false && <div><button className="text-left-gap" onClick={() => {alert('working on')}}>{mitgliedEditSprache[this.state.sprachsetting].gelten}</button></div>}
                            </th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].verzugSprache}:</td>
                            <th><div className="text-left-gap">
                                <select value={this.state.sprachsetting} onChange={(e) => this.setState({ sprachsetting: e.target.value })}>
                                    <option value="">---</option>
                                    <option value={0}>English</option>
                                    <option value={1}>繁體</option>
                                    <option value={2}>简体</option>
                                    <option value={3}>Polski</option>
                                </select>
                            </div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].offiziellName}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.wirklichname} type="text" onChange={(e) => {this.setState({ wirklichname: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].email}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.email} type="text" onChange={(e) => {this.setState({ email: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].phone}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.phone} type="text" onChange={(e) => {this.setState({ phone: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].standOrt}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.ort} type="text" onChange={(e) => {this.setState({ ort: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].spracheSprechen}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.sprache} type="text" onChange={(e) => {this.setState({ sprache: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].firmWerk}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.firm} type="text" onChange={(e) => {this.setState({ firm: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].besetzung}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.scope} type="text" onChange={(e) => {this.setState({ scope: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].aufSpezialisieren}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.field} type="text" onChange={(e) => {this.setState({ field: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].kontoTitel}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.title} type="text" onChange={(e) => {this.setState({ title: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].website}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.website} type="text" onChange={(e) => {this.setState({ website: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].sozialeNetzwerke}:</td>
                            <th><div className="text-left-gap"><input className="input-personal-infor" placeholder={this.state.social} type="text" onChange={(e) => {this.setState({ social: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].anschreiben}:</td>
                            <th><div className="text-left-gap"><textarea className="input-personal-infor" placeholder={this.state.brief} onChange={(e) => {this.setState({ brief: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].erfahrung}:</td>
                            <th><div className="text-left-gap"><textarea className="input-personal-infor" placeholder={this.state.experience} onChange={(e) => {this.setState({ experience: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].ausbildung}:</td>
                            <th><div className="text-left-gap"><textarea className="input-personal-infor" placeholder={this.state.education} onChange={(e) => {this.setState({ education: e.target.value })}}/></div></th>
                        </tr>
                        <tr>
                            <td>{mitgliedEditSprache[this.state.sprachsetting].angebot}:</td>
                            <th><div className="text-left-gap"><textarea className="input-personal-infor" placeholder={this.state.quotation} onChange={(e) => {this.setState({ quotation: e.target.value })}}/></div></th>
                        </tr>
                    </table>
                </div>
                <div className="center"><button className="update" onClick={() => {this.updateData()}}>{mitgliedEditSprache[this.state.sprachsetting].updateButton}</button></div>
            </Container>
        )
    }
}

export default MitgliedEdit;
