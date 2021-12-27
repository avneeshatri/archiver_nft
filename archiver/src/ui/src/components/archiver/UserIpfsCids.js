import React, {Component} from 'react'
import { isUndefined,fetchPromise,displayCustomPopup } from '../common/CustomUtilities';

class UserIpfsCids extends Component {

  cidsApiUrl = "/get_ipfs_cids/"
  uploadToIpfsApiUrl = "/upload_to_ipfs/"

  constructor(props) {
    super(props);
    this.state = {
      ipfsCids: [],
      user : props.user,
      archiver: props.archiver
    };
    this.fetchIpfsCidsForUser = this.fetchIpfsCidsForUser.bind(this);
    this.uploadToIpfs = this.uploadToIpfs.bind(this)
    this.callArchiveOnEth = this.callArchiveOnEth.bind(this)
  }

  callArchiveOnEth(ipfs_cid){
    if(!isUndefined(ipfs_cid)){
      this.state.archiver.methods.archive(ipfs_cid).send({from: this.state.user}).on('transactionHash', (hash) => {
        var popupMsg = { msg : "Archived  successfully" , detailedMsg: "File was uploaded to ipfs and cid was logged on ethereum"}
        displayCustomPopup(popupMsg,"success")
      })
    } else {
      console.log("No cid passed")
    }
  }


  componentDidMount() {
    console.log("Mounting Ipfs Cids Page component")
    this.fetchIpfsCidsForUser();
  }

  ipfsCidsFetchUri(){
    console.log("User account for cids:"+this.state.user)
    return (
      this.cidsApiUrl + this.state.user
    )
  }

  ipfsUploadUri(){
    console.log("User account for uploadin ipfs:"+this.state.user)
    return (
      this.uploadToIpfsApiUrl + this.state.user
    )
  }

  // Image Preview Handler
  handleImagePreview = (e) => {

        let image_as_files = e.target.files[0]
        let image_as_base64 = URL.createObjectURL(image_as_files)
  }

  uploadToIpfs(){
    const fileInput = document.querySelector("#fileInput");

    if (fileInput !== null){

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        var options = {
          method: "POST",
          body: formData
        }

        fetchPromise(this.ipfsUploadUri() ,options)
          .then(response => {
              var cids = this.state.ipfsCids ;
              var cid = response.cid;
              if(cids.includes(cid)){
                console.log("Cid already added");
                var popupMsg = { msg : "Already Archived" , detailedMsg: "You have archived file already"}
                displayCustomPopup(popupMsg,"error")
                return null ;
              } else {
                this.callArchiveOnEth(response.cid)
                return response.cid;
              }
          }).then(
            cid => {
              if(!isUndefined(cid)){
                var cids = this.state.ipfsCids   
                cids.push(cid)
                this.setState({
                  ipfsCids : cids
                })
              }
            }
          )
          .catch(error => {
              console.error('Some error while uploading to user ipfs cids', error);
          });
    } else {
      console.log("No image file selected")
    }
  }

  fetchIpfsCidsForUser(){
    var options = {'method':'GET'} 
    fetchPromise(this.ipfsCidsFetchUri(),options)
    .then(response => {
        var docs = [] ;

        if(response.cids != null){
            docs = response.cids ;
        }
    
        var popupMsg = { msg : "Refreshed CIDs" , detailedMsg: "Your all ipfs cids fetched"}
        displayCustomPopup(popupMsg,"info")

        this.setState({ ipfsCids: docs });     
    })
    .catch(error => {
        this.setState({ ipfsCids: [] });
        console.error('Some error in fetching user ipfs cids', error);
    });
}


  render() {
    return (
        <div id='content' className='container form-control-lg'>
          <div className="row">
            <label className="label">Your IPFS CIDs</label>
          </div>
           

          <input type="button" className="btn btn-info" value='refresh' onClick={(e) => this.fetchIpfsCidsForUser(e,this.state.user)} />

          <div className="grid container ">
            <table className="table table-striped table-hover"> 
            <thead className="th">
              <tr>
                
                 <td> Sno </td>
                 <td> CIDS </td>
                
              </tr>
              </thead>
              <tbody className="tbody">
                {
                  
                    this.state.ipfsCids.map((item, i) => {
                                return (
                                  <tr>
                                    <td>
                                        {i + 1}
                                    </td>
                                    <td key={i}>
                                            <a href={"http://ipfs.io/ipfs/"+item} >{item}</a>
                                    </td>
                                  </tr>
                                )
                    
                            }
                    )
                }
                </tbody>
                </table>
            </div>
            <div className="container form-control-sm">
          
                <div className="row">
                  <div className="col-sm">
                     {/* image input field */}
                    <input id="fileInput"  className="btn btn-secondary"
                        type="file"
                        onChange={this.handleImagePreview}
                    />
                  </div>
                  <div className="col-sm">
                     <input  className="btn btn-primary " type="submit" onClick={this.uploadToIpfs} value="Upload"/>
                  </div>
                </div>  
                
            </div>
        </div>
      );
    }
  }
    
export default UserIpfsCids;