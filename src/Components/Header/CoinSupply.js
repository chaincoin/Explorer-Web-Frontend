import { map } from 'rxjs/operators';

import React from 'react';
import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import ObservableText from "../ObservableText";

import BlockchainServices from '../../Services/BlockchainServices';


export default () =>{
  return (
    <div>
      <Card>
        <CardHeader>
          Coin Supply (CHC)
        </CardHeader>
        <CardBody>
          <CardText>
            <ObservableText value={BlockchainServices.txOutSetInfo.pipe(map(txOutSetInfo => txOutSetInfo.total_amount))} loadingText="Loading" />
          </CardText>
        </CardBody>
      </Card>
    </div>
      
  );
}
