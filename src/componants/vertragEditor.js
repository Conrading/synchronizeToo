import React, {Component} from 'react';
import {EditorState, convertFromRaw, convertToRaw, convertFromHTML, ContentState, Modifier} from "draft-js";
import {Editor} from "react-draft-wysiwyg"
//import draftToHtml from 'draftjs-to-html';
import './rich.css'

/*
function uploadImageCallBack(file) {
    return new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.imgur.com/3/image');
        xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
        const data = new FormData();
        data.append('image', file);
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        });
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        });
      }
    );
  }
*/

class EditorContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      temporStorage: null,
      saveStatus: "",
      htmlTest: null,
      //editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(localStorage.getItem('content'))))
      showAgreeBlock: false,
      signatureInput: null,
      contractModifyMode: this.props.contractModifyMode
    };
    this.signWithSignature = this.signWithSignature.bind(this)
  }
  componentDidMount () {
    if ( this.props.content !== null) {
        this.setState({ 
          //editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(localStorage.getItem('content')))),
          editorState: EditorState.createWithContent(convertFromRaw(this.props.content)),
          contractModifyMode: this.props.contractModifyMode
      })
    }
  }
  onEditorStateChange: Function = (editorState) => {
    //console.log(editorState._immutable.map)
    this.setState({editorState});
    const content = editorState.getCurrentContent()
    this.setState({ temporStorage: convertToRaw(content), saveStatus: "saving" })
    window.localStorage.setItem('content', JSON.stringify(this.state.temporStorage))
    this.setState({saveStatus: "Saved in temperary storage!"})
  };
  signWithSignature () {
    const {editorState} = this.state;
    //generate data within Draft.js
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    const encode = window.btoa(JSON.stringify({
      "signaure": this.state.signatureInput,
      "time": today
    }))
    //
    //decode success!
    //const decode = window.atob(encode)
    //get  the current data in html status
    //const currentContent = convertToRaw(editorState.getCurrentContent())
    //
    const htmlSignature = `<p><b>Signature: </b> ${this.state.signatureInput}</p>` + `<p><b>Date and Time: </b> ${today}</p>` + `<b>Signature Hash: </b>${encode}` 
    const blocksFromHTML = convertFromHTML(htmlSignature)
    const update = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    )
    let updateContent = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(), //means insert at the mouse pointer position
      update.getBlockMap()
    )
    this.setState({ editorState: EditorState.createWithContent(updateContent), saveStatus: "Please click within editing area, make sure you have inked signature!" })
  }
  render(){
    const { editorState } = this.state;
    return <div className='editor'>
      <Editor
        editorState={editorState}
        onEditorStateChange={this.onEditorStateChange}  
        toolbar={{
          inline: { inDropdown: true },
          list: { inDropdown: true },
          textAlign: { inDropdown: true },
          link: { inDropdown: true },
          history: { inDropdown: true },
          //image: { uploadCallback: uploadImageCallBack, alt: { present: true, mandatory: true } },
        }}
      />
      <br />
      {(this.state.contractModifyMode === "empty" || 
        this.state.contractModifyMode === "reviewing" ||
        this.state.contractModifyMode === "created" ||
        this.state.contractModifyMode === "negotiation") && <button className="default" onClick={() => {
          this.setState({ showAgreeBlock: !this.state.showAgreeBlock })
        }}>Sign</button>}
      <div className="text-trademakr-infor text-left-gap">{this.state.saveStatus}</div>
      <br />
      {this.state.showAgreeBlock === true &&
      <div>
      <br />
      <p>Type something as your signature</p>
      <row><input placeholder="Signature" onChange={(e) => this.setState({ signatureInput: e.target.value })}></input></row>
      <row>
      <button className="default" onClick={() => this.signWithSignature()}>Ink Signature</button></row>
      </div>}
    </div>
  }
}



export default EditorContainer

