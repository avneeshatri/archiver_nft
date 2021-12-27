import React, { Component } from 'react'
import { isUndefined, fetchPromise, displayCustomPopup } from '../common/CustomUtilities';


var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class Gallery extends Component {
  cidsApiUrl = "/nft/get_user_tokens/"
  uploadToIpfsApiUrl = "/upload_to_ipfs/"


  constructor(props) {
    super(props);
    this.state = {
      ipfsCids: [],
      user: props.user,
      gallery: props.gallery,
      gallery_address: props.gallery_address,
      isMinting : false
    };

    this.fetchIpfsCidsForUser = this.fetchIpfsCidsForUser.bind(this);
    this.uploadToIpfs = this.uploadToIpfs.bind(this)
  }

  componentDidMount() {
    console.log("Mounting Ipfs Cids Page component")
    this.fetchIpfsCidsForUser();
  }

  signDataAndMint = async (ipfs_hash, ipfs_url) => {
//    const ipfs_hash = "QmZPoCCKnqQ6tA7aNHZ3bRbYodM8qo8Cs2Uj26eTTc9fSJ"
//    const ipfs_url = "http://ipfs.io/ipfs/QmZPoCCKnqQ6tA7aNHZ3bRbYodM8qo8Cs2Uj26eTTc9fSJ"

    var web3 = window.web3
    const { user, gallery, gallery_address } = this.state;
    console.log('gallery address:' + gallery_address)
    var signer = user;
    var deadline = Date.now() + 100000;
    console.log(deadline);


    const chainId = await web3.eth.getChainId()
    console.log("chainId", chainId);
    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, function (err, result) {
      const netId = result.result;
      console.log("netId", result);
      const msgParams = JSON.stringify({
        types:
        {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" }
          ],
          set: [
            { name: "sender", type: "address" },
            { name: "ipfs_hash", type: "string" },
            { name: "ipfs_url", type: "string" },
            { name: "deadline", type: "uint" }
          ]
        },
        //make sure to replace verifyingContract with address of deployed contract
        primaryType: "set",
        domain: { name: "GalleryERC721", version: "1", chainId: chainId, verifyingContract: gallery_address },
        message: {
          sender: signer,
          ipfs_hash: ipfs_hash,
          ipfs_url: ipfs_url,
          deadline: deadline
        }
      })

      var from = signer;

      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v3'

      web3.currentProvider.sendAsync({
        method,
        params,
        from,
      }, async function (err, result) {
        if (err) return console.dir(err)
        if (result.error) {
          alert(result.error.message)
        }
        if (result.error) return console.error('ERROR', result)
        console.log('TYPED SIGNED:' + JSON.stringify(result.result))

        const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })

        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
          console.log('Successfully ecRecovered signer as ' + from)
        } else {
          alert('Failed to verify signer when comparing ' + result + ' to ' + from)
        }

        //getting r s v from a signature
        const signature = result.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        console.log("r:", r);
        console.log("s:", s);
        console.log("v:", v);

        await gallery.methods.executeMintIfSignatureMatch(v, r, s, signer, deadline, ipfs_hash, ipfs_url).send({ from: user });

      })
    })

          
    this.setState({isMinting:false});
  }


  ipfsUploadUri() {
    console.log("User account for uploadin ipfs:" + this.state.user)
    return (
      this.uploadToIpfsApiUrl + this.state.user
    )
  }

  uploadToIpfs(){
    const fileInput = document.querySelector("#fileInput");

    if (fileInput !== null) {

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      var options = {
        method: "POST",
        body: formData
      }

      fetchPromise(this.ipfsUploadUri(), options)
        .then(response => {
          var cids = this.state.ipfsCids;
          var cid = response.cid;
          if (this.hasAlreadyMinted(cid)) {
            console.log("Cid already added");
            var popupMsg = { msg: "Already Archived", detailedMsg: "You have archived file already" }
            displayCustomPopup(popupMsg, "error")
            return null;
          } else {
            var ipfs_hash = response.cid ;
            var ipfs_url = "http://ipfs.io/ipfs/" + ipfs_hash;
            this.signDataAndMint(ipfs_hash,ipfs_url)
            return response.cid;
          }
        })
        .catch(error => {
          console.error('Some error while uploading to user ipfs cids', error);
        });
    } else {
      console.log("No image file selected")
    }
  }

  hasAlreadyMinted(cid){
    var status = false 
    var cids = this.state.ipfsCids
    cids.map((item, i) => {
      if(!status && item.hash == cid){
        console.log("Already minted:"+ cid)
        status = true ;
      }
    })
    return status;
  }


  ipfsCidsFetchUri() {
    console.log("User account for cids:" + this.state.user)
    return (
      this.cidsApiUrl + this.state.user
    )
  }

  fetchIpfsCidsForUser() {
    var options = { 'method': 'GET' }
    fetchPromise(this.ipfsCidsFetchUri(), options)
      .then(response => {
        var docs = [];
        console.log(response)
        if (response.tokens != null) {
          docs = response.tokens;
        }

        var popupMsg = { msg: "Refreshed CIDs", detailedMsg: "Your all ipfs cids fetched" }
        displayCustomPopup(popupMsg, "info")

        this.setState({ ipfsCids: docs });
      })
      .catch(error => {
        this.setState({ ipfsCids: [] });
        console.error('Some error in fetching user ipfs cids', error);
      });
  }


  render() {
    if (!window.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div>

        <div id='content' className='container form-control-lg'>
          <div className="row">
            <label className="label">Your IPFS CIDs</label>
          </div>


          <input type="button" className="btn btn-info" value='refresh' onClick={(e) => this.fetchIpfsCidsForUser(e)} />

          <div className="grid container ">
            <table className="table table-striped table-hover">
              <thead className="th">
                <tr>

                  <td> Sno </td>
                  <td> Token Id </td>
                  <td> Ipfs CID </td>

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
                        <td>
                          {item.token}
                        </td>
                        <td key={i}>
                          <a href={"http://ipfs.io/ipfs/" + item.hash} >{item.hash}</a>
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
                <input id="fileInput" className="btn btn-secondary"
                  type="file"
                  onChange={this.handleImagePreview}
                />
              </div>
              <div className="col-sm">
                <input className="btn btn-primary " type="submit" onClick={this.uploadToIpfs} value="Upload" />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}


export default Gallery;