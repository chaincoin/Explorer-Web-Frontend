import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link, withRouter } from "react-router-dom";

import { combineLatest, of } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';

import BlockchainServices from '../Services/BlockchainServices';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Input 
 } from 'reactstrap';

const styles = {
  root: {
    
  },
  navbarBrand:{
    color: "#27B463 !important",
    "font-weight": "bold"
  },
  navbar : {
      "border-bottom": "2px solid #27B463"
  },

  searchButton:{
    "color": "#28a745",
    "border" : "1px solid #28a745",
  }
};

class ChaincoinExplorerNavBar extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      searchInput: ""
    };
  }


  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleSearchInputChange = (event) => {
    this.setState({searchInput: event.target.value});
  }

  handleSearch = (event) =>{
    event.preventDefault();

    const { searchInput } = this.state;



    try
    {
      window.bitcoin.address.toOutputScript(searchInput,BlockchainServices.Chaincoin);
      this.props.history.push('/Explorer/Address/' + searchInput);
      return;
    }
    catch(ex){
      //not an address
    }

   

    //is masternode output - could also check for ip
    if (/^[a-fA-F0-9]{64}-[0-9]{1,8}$/.test(searchInput))
    {
      this.props.history.push('/Explorer/Masternode/' + searchInput);
      return;
    }

    
    //Maybe block or transaction
    if (/^[a-fA-F0-9]{64}$/.test(searchInput))
    {
      combineLatest(
        BlockchainServices.getBlock(searchInput)
        .pipe(
          map((block) =>{
            if (block == null) throw new Error('Unabled to find block');  //TODO; need to fix api
            return block;
          }),
          catchError(err => of(null))
        ), 
        BlockchainServices.getTransaction(searchInput)
        .pipe(
          map((transaction) =>{
            if (transaction == null) throw new Error('Unabled to find transaction');  //TODO; need to fix api
            return transaction;
          }),
          catchError(err => of(null))
        ), 
      ).pipe(
        first()
      )
      .subscribe(([block, transaction, address, masternode])=>{
        if (block != null ) this.props.history.push('/Explorer/Block/' + searchInput);
        else if (transaction != null) this.props.history.push('/Explorer/Transaction/' + searchInput);
        else this.props.history.push('/NotFound/' + searchInput);
      });

      return;
    }

    this.props.history.push('/NotFound/' + searchInput);

  }


  render(){
    const { classes } = this.props;
    const { searchInput } = this.state;

    return (
      <div>
      <Navbar color="light" light expand="md" className={classes.navbar}>
        <NavbarBrand tag={Link} to={'/'} className={classes.navbarBrand}>Chaincoin Explorer</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar className="mr-auto">
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Explorer
              </DropdownToggle>
              <DropdownMenu>
                <Link to="/Explorer">
                  <DropdownItem>
                    Block List
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/MasternodeList">
                  <DropdownItem>
                  Masternode List
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/MasternodeWinnersList">
                  <DropdownItem>
                  Masternode Winners
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/RichList">
                  <DropdownItem>
                  Rich List
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/PeerList">
                  <DropdownItem>
                  Peer List
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/MemPool">
                  <DropdownItem>
                  Mem Pool
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/ChainTips">
                  <DropdownItem>
                  Chain Tips
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/BannedList">
                  <DropdownItem>
                  Banned List
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/ProposalList">
                  <DropdownItem>
                  Proposal List
                  </DropdownItem>
                </Link>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink tag={Link} to={'/Explorer/MyWallet'}>My Wallet</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to={'/BountyList'}>Bounty List</NavLink>
            </NavItem>

            <NavItem>
              <NavLink tag={Link} to={'/Api'}>Api</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to={'/News'}>News</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to={'/Tutorials'}>Tutorials</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://www.chaincoin.org//" target="blank">Chaincoin Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to={'/ContactMe'}>Contact Me</NavLink>
            </NavItem>
          </Nav>

          <Form inline={true} onSubmit={this.handleSearch}>
            <FormGroup>
                <Input placeholder="Search" className={classes.searchInput} value={searchInput} onChange={this.handleSearchInputChange} />
                <Button className={classes.searchButton} type="submit">
                  Search
                </Button>
            </FormGroup>
          </Form>
          
        </Collapse>
      </Navbar>
    </div>
      
    );
  }

  
}

ChaincoinExplorerNavBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ChaincoinExplorerNavBar));