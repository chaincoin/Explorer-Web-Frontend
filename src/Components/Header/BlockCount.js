import React from 'react';
import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import ObservableText from "../ObservableText";

import BlockchainServices from '../../Services/BlockchainServices';

export default () =>{
  return (
    <div>
      <Card>
        <CardHeader>
          Block Count
        </CardHeader>
        <CardBody>
          <CardText>
            <ObservableText value={BlockchainServices.blockCount} loadingText="Loading" />
          </CardText>
        </CardBody>
      </Card>
    </div>
      
  );
}