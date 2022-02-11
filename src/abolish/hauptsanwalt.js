import React, { Component } from "react";
import './gesichtEin.css'
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Card, CardBody, Table } from 'reactstrap'
import Modal from './modal'
import http from './http-axios'
import ReactPlayer from 'react-player';
//import { Image } from 'react-bootstrap'


class Hauptsanwalt extends Component {
    constructor () {
        super ();
        this.state = {
        //sort out how to present data
            //aussortieren: "zeit", //the variable to sort out data, work with "sortOutData"
            aussortierenPopUp: false, //to show the pop up frame to sort out data
            typeValue: "Card", //including full list, application, valid trademark, history
            applicantSearch: null,
            locationSearch: null,
            dateAfter: null, //to sort out data after date

            importDefualtList: [] //import from defualt backend
        }
        //sort out how to present data
        this.sortPopUp = this.sortPopUp.bind(this) //pop out the frame for suer to sort out
        this.sortOutData = this.sortOutData.bind(this) //sort out the data user wants to present
        this.resetAll = this.resetAll.bind(this) //reset variable after sort data
    }
    componentDidMount () {
        //show data without log-in
        http.get("/attorney").then(res => {
            this.setState({ importDefualtList: res.data.attorneyInfor })
        }) 
    }
    sortPopUp () {
        //sort out the data user wants to present
        this.setState({ aussortierenPopUp: true })
    }
    sortOutData () {
        //lower case of applicant
        let lowerCaseApplicant
        if (this.state.applicantSearch == null) {
            lowerCaseApplicant = this.state.applicantSearch
        } else { lowerCaseApplicant = this.state.applicantSearch.replace(/\W+/g, '-').toLowerCase() }
        //lower case of brand
        let lowerCaseLocation
        if (this.state.locationSearch == null) {
            lowerCaseLocation = this.state.locationSearch
        } else { lowerCaseLocation = this.state.locationSearch.replace(/\W+/g, '-').toLowerCase() }
        //collect all data
        const array = [
            {
                applicant: lowerCaseApplicant,
                location: lowerCaseLocation,
                searchDate: this.state.dateAfter
            }
        ]
        //submit the data sort out critaria
        http.post("/hauptsachlich", array).then((res) => {
            this.resetAll ()
           if (res.data.negative === "empty") {
               alert("Sorry, data no found, perhaps first letter is capital, please input again")
            } else {
                this.setState({ importDefualtList: res.data })
            } 
        })
    }
    resetAll () {
        //set several variable to defualt
        this.setState({
            aussortierenPopUp: false, //to show the pop up frame to sort out data
            applicantSearch: null,
            locationSearch: null,
            dateAfter: null, //to sort out data after date
        })
    }
    render () {
        let cardSplieler = this.state.importDefualtList.map( i => {
            return (
                <Card className='e'>
                    <Row className='center-object'>
                        {i.imag !== null &&
                        <img top height="250px" width="100px" class="center"
                            src={i.imag}
                            alt="no Lawyer's image" />}
                        {i.video !== null &&
                        <ReactPlayer
                            key={i.attorneynumer}
                            className="player-itself"
                            url= {i.video}
                            width='200px'
                            height='150px'
                            muted = 'true'
                            />}
                    </Row>
                    <CardBody>
                        <Row><Col>Charity Title</Col><Col><b>{i.titel}</b></Col></Row>
                        <Row><Col>Created Date</Col><Col><b>{i.datem}</b></Col></Row>
                        <hr />
                        <Row className='center-object'><Button outline color="link" onClick={() => {window.location = `/attorney/id=${i.attorneynumer}`}}>More Detail</Button></Row>
                    </CardBody>
                </Card>)
        })
        let tableSplieler = this.state.importDefualtList.map( i => {
            return (
                <tbody>
                    <td className="center-text">{i.firm}</td>
                    <td className="center-text">{i.titel}</td>
                    <td className="center-text">{i.ort}</td>
                    <td className="center-text">{i.datem}</td>
                    <td className="center-text"><div onClick={() => {window.location = `/attorney/id=${i.attorneynumer}`}}>Click</div></td>
                </tbody>
            )
        })
        return (
            <Container>
                <Row>
                    {/*<Col><Button outline color="primary"><div href="javascript:;" onClick={e => this.sortPopUp(e)}>Sort by other condition</div></Button></Col>*/}
                    <Col className="object-right">
                        <FormGroup row>
                            <Col sm={8}>
                                <select onChange={(e) => this.setState({ typeValue: e.target.value })}>
                                    <option value="Card">Shown by Card</option>
                                    <option value="Full List">Shown by Full List</option>
                                </select>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>
                <div>    {/*for sort out by time, applicant or other condition */}
                    <Modal show={this.state.aussortierenPopUp} closeBox={e => this.resetAll(e)}>
                    <Form>
                        <FormGroup row>
                            <Label sm={3}>Applicant</Label>
                            <Col sm={8}>
                                <Input type="text" 
                                    onChange={(e) => this.setState({ applicantSearch: e.target.value })}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label sm={3}>Location</Label>
                            <Col sm={8}>
                                <Input type="text" 
                                    onChange={(e) => this.setState({ locationSearch: e.target.value })}/>
                            </Col>
                        </FormGroup>
                        {/*}
                        <FormGroup row>
                            <Label sm={3}>Date After</Label>
                            <Col sm={8}>
                                <Input type="date" 
                                    placeholder="select date"
                                    onChange={(e) => this.setState({ dateAfter: e.target.value })}/>
                            </Col>
                        </FormGroup>
                        */}
                    </Form>
                    <br />
                    <div className="center-object">
                        <Button type="submit" outline color="info" onClick={e => this.sortOutData(e)}>Sort Out</Button>
                    </div>
                    </Modal>
                </div>    {/*for sort out by time, applicant or other condition */}
                <br />
                {this.state.typeValue === "Card" &&
                <Container>
                    <Row>{cardSplieler}</Row>
                </Container>
                }
                {this.state.typeValue === "Full List" &&
                <Container>
                    <Row>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Firm</th>
                                    <th>Attorney Title</th>
                                    <th>Location</th>
                                    <th>Created Date</th>
                                    <th>Detail</th>
                                </tr>
                            </thead>
                            {tableSplieler}
                        </Table>
                    </Row>
                </Container>
                }
            </Container>
        )
    }
}

export default Hauptsanwalt;
