import React from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { TextValidator} from 'react-material-ui-form-validator';


const styles = {
  recipient:{
    "padding-bottom":"10px"
  },
  recipientAddress:{
    "width":"100%"
  },
  recipientAmount:{
    "width":"100%"
  },
  recipientDivider:{
    "margin-top":"10px",
    "background-color": "#27B463"
  }
};

class Recipients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipients:[{
        address: "",
        amount: ""
      }]
    };
  }


  componentDidMount() {
    if (this.props.onRef != null) this.props.onRef(this);
    this.props.recipientsChange(this.state.recipients);
  }


  clear = () =>{
    var recipients = [{
      address: "",
      amount: ""
    }];

    this.setState({ recipients })

    this.props.recipientsChange(recipients);
  }
  
  handleAddRecipientClick = () =>{

    var recipients = this.state.recipients.concat([{
      address: "",
      amount: ""
    }]);

    this.setState({
      recipients: recipients
    });

    this.props.recipientsChange(recipients);
  }


  renderRecipient = (recipient, pos) =>{
    const { classes } = this.props;
    const { recipients } = this.state;

    const handleAddressChange = (event) =>{
      recipient.address = event.target.value;
      this.setState({
        recipients: recipients.slice()
      });

      this.props.recipientsChange(recipients);
    }

    const handleAmountChange = (event) =>{
      recipient.amount = event.target.value;
      this.setState({
        recipients: recipients.slice()
      });

      this.props.recipientsChange(recipients);
    }

    const handleRemoveClick = () =>{

      var recipients = this.state.recipients.filter(r => r != recipient);
      this.setState({
        recipients: recipients
      });

      this.props.recipientsChange(recipients);
    }

    return (
      <div className={classes.recipient}>

        <Grid container spacing={24}>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <TextValidator
              label="Pay To"
              onChange={handleAddressChange}
              value={recipient.address}
              validators={['required', 'isChaincoinAddress']}
              errorMessages={['Address required',"Invalid address"]}
              className={classes.recipientAddress}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <TextValidator
              label="Amount"
              onChange={handleAmountChange}
              value={recipient.amount}
              validators={['required', 'matchRegexp:^[0-9]\\d{0,9}(\\.\\d{0,8})?%?$']}
              errorMessages={['Amount required',"Invalid amount"]}
              className={classes.recipientAmount}
            />
          </Grid>
          {
            pos != 0 ?
            (
            <Grid item xs={12} sm={12} md={2} lg={1}>
              <Button variant="contained" color="secondary" onClick={handleRemoveClick}>Remove</Button>
            </Grid>
            )
            : null
          }
          
        </Grid>

      </div>
    );
  }


  render(){
    const { recipients } = this.state;
    return (
      <div>
        {recipients.map(this.renderRecipient)}
        <div>
          <Button variant="contained" color="primary" onClick={this.handleAddRecipientClick}>Add Recipient</Button>
        </div>
      </div>
    )
  }
}



Recipients.propTypes = {
  classes: PropTypes.object.isRequired,
  recipientsChange: PropTypes.func.isRequired
};

export default withStyles(styles)(Recipients);



