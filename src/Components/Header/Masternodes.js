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
          Masternodes
        </CardHeader>
        <CardBody>
          <CardText>
            <ObservableText value={BlockchainServices.masternodeCount.pipe(map(masternodeCount => `Total: ${masternodeCount.total} / Enabled: ${masternodeCount.enabled}`))} loadingText="Loading" />
          </CardText>
        </CardBody>
      </Card>
    </div>
      
  );
}

