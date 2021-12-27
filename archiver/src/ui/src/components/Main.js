import React, { Component } from 'react'
import Web3 from 'web3'
import Archiver from '../contract_meta/Archiver.json'
import GalleryERC721 from '../contract_meta/GalleryERC721.json'
import UserIpfsCids from './archiver/UserIpfsCids'
import Gallery from './archiver/Gallery'

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account : '',
      loading : true,
      archiver: null,
      gallery: null,
      gallery_address: null
    };
   
  }

 async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log("User Account : "+accounts)
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId()

    //LOAD Archiver
    const archiverData = Archiver.networks[networkId]
    if(archiverData) {
      console.log('Contract Address :' + archiverData.address)
      const archiver = new web3.eth.Contract(Archiver.abi, archiverData.address)
      this.setState({archiver})
    } else {
      window.alert("archiver contract not deployed to detect network")
    }


    //LOAD Gallery
    const galleryErc721Data = GalleryERC721.networks[networkId]
    if(galleryErc721Data) {
      console.log('Contract Gallery :' + galleryErc721Data.address)
      const gallery = new web3.eth.Contract(GalleryERC721.abi, galleryErc721Data.address)
      this.setState({gallery})
      this.setState({gallery_address : galleryErc721Data.address })
    } else {
      window.alert("GalleryERC721 contract not deployed to detect network")
    }

    this.setState({loading: false})
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non ethereum browser detected. You should consider Metamask')
    }
  }

  loadUserIpfsCids(){
    if(!this.state.loading){
      return (
        <UserIpfsCids 
        user={this.state.account}
        archiver={this.state.archiver}
        ></UserIpfsCids>
      )
    }
  }


  loadGallery(){
    if(!this.state.loading){
      return (
        <Gallery
        user={this.state.account}
        gallery={this.state.gallery}
        gallery_address={this.state.gallery_address}></Gallery>
      )
    }
  }

  render() {
    return (
        <div id='content' className='mt-3'> 
        {
         // this.loadUserIpfsCids()
        }

        <hr  style={{
            color: '#000000',
            backgroundColor: '#000000',
            height: 1,
            borderColor : '#000000'
        }}/>


        {
          this.loadGallery()
        }
        </div>
      );
    }
}
export default Main;