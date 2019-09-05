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
          Network
        </CardHeader>
        <CardBody>
          <CardText>
            <ObservableText value={BlockchainServices.networkHashps.pipe(map(networkHashps => hashpsToString(networkHashps)))} loadingText="Loading" />
          </CardText>
        </CardBody>
      </Card>
    </div>
      
  );
}




var hashpsToString = (hashps) =>
{
  if (hashps < 1000)
  {
      return (hashps).toFixed(2) + " H/s";
  }
  else if (hashps >= 1000 && hashps < 1000000)
  {
      return (hashps / 1000).toFixed(2) + " KH/s";
  }
  else if (hashps >= 1000000 && hashps < 1000000000)
  {
      return (hashps / 1000000).toFixed(2) + " MH/s";
  }
  else if (hashps >= 1000000000 && hashps < 1000000000000)
  {
      return (hashps / 1000000000).toFixed(2) + " GH/s";
  }
  else 
  {
      return (hashps / 1000000000000).toFixed(2) + " TH/s";
  }
}