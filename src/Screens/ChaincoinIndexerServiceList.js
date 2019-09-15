import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';



const styles = theme => ({
    root: {
        flexGrow: 1,
        overflow: 'hidden',
        padding: `0 ${theme.spacing.unit * 3}px`,
      },
      paper: {

        margin: `${theme.spacing.unit}px auto`,
        padding: theme.spacing.unit * 2,
      },
  });


  const message = `Truncation should be conditionally applicable on this long line of text
  as this is a much longer line than what the container can support. `;
  
class ChaincoinIndexerServiceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          error: null,
          isLoaded: false,
          items: []
        };
    }
    


    render() {

        const { error, isLoaded, items } = this.state;

        if (error)
        {
            return <div>Error: {error.message}</div>;
        }
        else if (!isLoaded)
        {
            return <div>Loading...</div>;
        }
        else{
            return (
                <div className={this.props.classes.root}>
                {items.map(i =>(
                    <Paper className={this.props.classes.paper}>
                        <Grid container wrap="nowrap" spacing={16}>
                        <Grid item>
                            <Avatar>W</Avatar>
                        </Grid>
                        <Grid item xs zeroMinWidth>
                            <Typography noWrap>{message}</Typography>
                        </Grid>
                        </Grid>
                    </Paper>
                ))}
                     
                </div>
            );
        }

      
    }



    componentDidMount() {
      fetch("https://api.chaincoinexplorer.co.uk/getIndexBlockCount")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            //items: result.items
            items: [
                {
                    data:"Test",
                },
                {
                    data:"Test",
                }
            ]
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
    }

  }



  ChaincoinIndexerServiceList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(ChaincoinIndexerServiceList);