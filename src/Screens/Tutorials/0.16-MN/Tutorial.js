import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';


import  CollateralPng from './images/Collateral.png'
import  masternodeOutputsPng from './images/masternode-outputs.png'

import  dockerPsPng from './images/docker-ps.png'
import  MasternodeConfPng from './images/Masternode-conf.png'
import  MasternodeConf2Png from './images/Masternode-conf-2.png'
import  mnsyncStatusPng from './images/mnsync-status.png'
import  startingMasternodePng from './images/starting-masternode.png'
import  masternodeStatusPng from './images/masternode-status.png'
import  masternodeStatus2Png from './images/masternode-status2.png'
import  couldNotAllocateOutpointPng from './images/could-not-allocate-outpoint.png'
import  MNBFailedToVerifyPng from './images/MNB-failed-to-verify.png'

const styles = {
  root: {
    "display": "table",
    "margin": "0 auto"
  }
};

class Tutorial extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <Card>
        <CardHeader>
        Chaincoin Masternode 0.16.4 Setup Guide - Ubuntu
        </CardHeader>
        <CardBody>
          <CardText>
          <h3>Masternode Collateral</h3>

            <p>
                every masternode needs 1000 chc as collateral, with out this you cannot continue!<br/>
                the collateral needs to be in the form of a single transaction to one of your address. <br/>
                so simply send exactly 1000 chc to one of your addresses.
            </p>
            <p>
                if you are sending from an exchange remember to take transaction fees into account<br/>
                so exactly 1000 chc is received by the address in a single transation
            </p>


            <img src={CollateralPng} class="col-md-8 center"/>

            <h3>Masternode Ouput</h3>

            <p>
                now to get your masternode output, go to your Chaincoin Wallet application and select "Tools" then "Debug Console",<br/>
                enter the command below into the box at the bottom of the window and press enter:
            </p>
            <div class="code">
                masternode outputs
            </div>

            <img src={masternodeOutputsPng} class="col-md-6 center"/>

            <p>
                you will probably only have 1 output, not 14 like me<br/>
                you will need this information later<br/>
                if the output is empty then go back to Masternode Collateral
            </p>

            <h3>Getting a Masternode Private Key</h3>
            <p>
                Now you will need to get a masternode key, you can get one <a href="http://api.chaincoinexplorer.co.uk/getMasternodePrivateKey" target="_blank">here</a><br/>
                dont give this away!!<br/>
                you will need this information later
            </p>


            <h3>Install Docker</h3>
            <p>
                now to install Docker run the commands below on you VPS/Ubuntu Server:
            </p>
            <div class="code">
                apt-get install curl<br/>
                curl -sSL https://get.docker.com | sh
            </div>

            <h3>Install Chaincoin 0.16.4 Linux</h3>
            <p>
                in the command below replace {'{masternode-key}'} with you masternode key but remove quotes, then run it on your VPS/Ubuntu Server:
            </p>
            <div class="code">
                docker run -d -it --name chaincoin -p 11994:11994 -e MASTERNODEPRIVKEY={'{masternode-key}'} mcna/chaincoin:0.16.4-mn-ubuntu
            </div>


            <p>
                To verify your masternode is running, simply run the command below on your VPS/Ubuntu Server
            </p>
            <div class="code">
                docker ps
            </div>

            <img src={dockerPsPng} class="col-md-12 center"/>
            <p>
                if you see a row like this with the name "chaincoin" then chaincoin is running
            </p>




            <h3>Configure masternode.conf</h3>

            <p>
                now your masternode is installed and running<br/>
                to be able to start your masternode first you will need to configure your Masternode in Chaincoin Wallet application,
                "Tools" -> "Open Masternode Configuration File".<br/>
                if your computer asks what to open it with, choose a text editor e.g. Notepad
            </p>

            
            <img src={MasternodeConfPng} class="col-md-8 center"/>
            
            <p>
                add a line to this file in the format below:
            </p>
            <div class="code">
                {'{Label}'} {'{ip}'}:11994 {'{masternode-key}'} {'{masternode-output-value-1}'} {'{masternode-output-value-2}'}
            </div>
            <p>
                {'{Label}'} can be anything e.g. MN1 <br/>
                {'{ip}'} needs to be the ip address of your server running your masternode<br/>
                {'{masternode-key}'} this is the masternode key from earlier and it must match the value used in the command earlier (but remove quotes)<br/>
                {'{masternode-output-value-1}'} this is the first value from your masternode output, remove the quotes<br/>
                {'{masternode-output-value-2}'} this is the second value from your masternode output, remove the quotes
            </p>

            <img src={MasternodeConf2Png} class="col-md-8 center"/>
            

            <p>
                save the file then close Chaincoin wallet and open it again to pick up masternode configuration changes
            </p>

            <h3>Is It Ready</h3>
            <p>
                next wait till your masternode has finished syncing, this can take a few hours.<br/>
                You can check to see if its done by running command below on your VPS/Ubuntu Server:
            </p>
            
            <div class="code">
                docker exec chaincoin chaincoin-cli mnsync status
            </div>

            <img src={mnsyncStatusPng} class="col-md-6 center"/>
            


            <p>
                if you see:
            </p>
            <div class="code">
                "IsSynced": true,
            </div>
            <p>
                you are ready to start your masternode
            </p> 

            <h3>Starting your Masternode</h3>
            <p>
                now your masternode has finished syncing its time to start it.<br/>
                go to Chaincoin Wallet, and click "Masternodes" next to "Transactions"<br/>
                if you cant find this tab then go to "Settings" -> "Wallet" and check show "masternodes tab"
            </p>

            <p>
                right click your masternode node and press "start alias"<br/>
            </p>

            <img src={startingMasternodePng} class="col-md-6 center"/>
            


            <p>
                now  on your linux server run the command:
            </p>
            <div class="code">
                docker exec chaincoin chaincoin-cli masternode status
            </div>
            <p>
                if "status" is "Masternode successfully started" then leave if for an hour<br/>
            </p>

            <img src={masternodeStatusPng} class="col-md-6 center"/>
            

            <p>
                final check your Chaincoin Wallet -> "Masternodes" tab and verify your masternode status is "ENABLED"<br/>
                if it is then you have finished your masternode setup.
            </p>

            <img src={masternodeStatus2Png} class="col-md-6 center"/>
            


            <h3>How to use your Masternode</h3>
            <p>
                to stop your masternode:
            </p>
            <div class="code">
                docker stop chaincoin
            </div>

            <p>
                to start your masternode:
            </p>
            <div class="code">
                docker start chaincoin
            </div>

            <p>
                to run chaincoin-cli commands simply prefix them with:
            </p>
            <div class="code">
                docker exec chaincoin chaincoin-cli
            </div>

            <p>
                e.g.
            </p>
            <div class="code">
                docker exec chaincoin chaincoin-cli help<br/>
                docker exec chaincoin chaincoin-cli getblockchaininfo
            </div>


            <h3>Troubleshooting</h3>


            <h4>Permssion Errors</h4>
            <p>
                if you get permssion errors when trying to run command simply prefix the commands with 
            </p>
            <div class="code">
                sudo
            </div>
            <p>
                e.g.
            </p>
            <div class="code">
                sudo apt-get install curl<br/>
                sudo docker exec chaincoin chaincoin-cli mnsync status
            </div>
            
            <h4>Couldnt start Masternode - Could not allocate outpoint</h4>
            <p>
                check you have copied your masternode output into the masternode.conf correctly.<br/>
                if you have then leave it 30 minutes for your transaction to get more confirmation and try again
            </p>
            <img src={couldNotAllocateOutpointPng} class="col-md-6 center"/>
            

            <h4>Failed to start masternode - Failed to verify MNB</h4>
            <p>
                check you have copied your masternode output into the masternode.conf correctly.<br/>
                check your masternode has finished syncing, go to section above "Is It Ready"
            </p>
            <p>
                if you have copied the key correctly and your masternode has finished syncing <br/> 
                then leave it 30 minutes for your transaction to get more confirmation and try again
            </p>
            <img src={MNBFailedToVerifyPng} class="col-md-2 center"/>
            

            <h4>My masternode status is "PRE_ENABLED" </h4>
            <p>
                leave it 30 minutes and check again
            </p>
            
            
            
            
            <h4>
                My masternode status is "SENTINEL_PING_EXPIRED"
            </h4>
            <p>
                check the sentinel log:
            </p>
            <div class="code">
                docker exec chaincoin cat /root/sentiel.log
            </div>


            <h4>
                My masternode keeps shutting down<br/>
            </h4>
            <p>
                check the chaincoin log:
            </p>
            <div class="code">
                docker logs chaincoin
            </div>

            <h4>Im stuck</h4>
            <p>
                post in Chaincoin support channel on <a href="https://discordapp.com/channels/376563577907183627/376580497129734154">discord</a>
            </p>
          </CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

Tutorial.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tutorial);