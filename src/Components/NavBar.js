import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";

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
  DropdownItem } from 'reactstrap';

const styles = {
  root: {
    
  },
  navbarBrand:{
    color: "#27B463 !important",
    "font-weight": "bold"
  },
  navbar : {
      "border-bottom": "2px solid #27B463"
  }
};

class ChaincoinExplorerNavBar extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }


  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }


  render(){
    const { classes } = this.props;
    return (
      <div>
      <Navbar color="light" light expand="md" className={classes.navbar}>
        <NavbarBrand tag={Link} to={'/'} className={classes.navbarBrand}>Chaincoin Explorer</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar>
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
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                My Wallet
              </DropdownToggle>
              <DropdownMenu>
                <Link to="/Explorer/MyWallet/MyAddresses">
                  <DropdownItem>
                    My Addresses
                  </DropdownItem>
                </Link>
                <Link to="/Explorer/MyWallet/MyMasternodes">
                  <DropdownItem>
                    My Masternodes
                  </DropdownItem>
                </Link>
              </DropdownMenu>
            </UncontrolledDropdown>
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
              <NavLink href="https://www.chaincoin.org//">Chaincoin Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to={'/ContactMe'}>Contact Me</NavLink>
            </NavItem>
            
          </Nav>
        </Collapse>
      </Navbar>
    </div>
      
    );
  }

  
}

ChaincoinExplorerNavBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincoinExplorerNavBar);