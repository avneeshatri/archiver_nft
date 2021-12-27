import flask
from flask import Flask, render_template, request
from ArchiverService import ArchiverService
from flask_cors import CORS, cross_origin


app = flask.Flask(__name__,static_folder='templates/static')
app.config["DEBUG"] = True
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#props_file = '/home/atri/workspace_ethereum/ethapp/archiver/src/app/archiver.properties'
props_file = 'archiver.properties'
archiver = ArchiverService(props_file)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/upload_to_ipfs/<user>', methods = ['GET', 'POST'])
def upload_to_ipfs(user):
   if request.method == 'POST':
      f = request.files['file']
      ipfs_hash = archiver.add_to_ipfs(user, f)
      return {'cid' : ipfs_hash}

@cross_origin()
@app.route('/get_ipfs_cids/<user>', methods = ['GET'])
def get_ipfs_cids(user):
    if request.method == 'GET':
        return {'cids':archiver.get_user_cids(user)}

@cross_origin()
@app.route('/nft/get_user_tokens/<user>', methods = ['GET'])
def get_user_tokens(user):
    if request.method == 'GET':
        return {'tokens':archiver.get_user_tokens(user)}


@cross_origin()
@app.route('/nft/user_token_balance/<user>', methods = ['GET'])
def get_user_token_balance(user):
    if request.method == 'GET':
        return {'balance':archiver.user_token_balance(user)}

@cross_origin()
@app.route('/nft/mint', methods = ['POST'])
def mint_token():
    if request.method == 'POST':
        data = request.json
        print(data)
        archiver.mint_token(data['address'],data['ipfs_hash'],data['ifps_url'])
        return {'status':'success'}

app.run()
