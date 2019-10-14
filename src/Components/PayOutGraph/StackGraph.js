import React from 'react';
import {Line, Bar} from 'react-chartjs-2';

const payOutsLineColours = [
    "rgb(230, 25, 75)", "rgb(60, 180, 75)", "rgb(255, 225, 25)", 
    "rgb(0, 130, 200)", "rgb(245, 130, 48)", "rgb(145, 30, 180)", 
    "rgb(70, 240, 240)", "rgb(240, 50, 230)", "rgb(210, 245, 60)", 
    "rgb(250, 190, 190)", "rgb(0, 128, 128)", "rgb(230, 190, 255)", 
    "rgb(170, 110, 40)", "rgb(255, 250, 200)", "rgb(128, 0, 0)", 
    "rgb(170, 255, 195)", "rgb(128, 128, 0)", "rgb(255, 215, 180)", 
    "rgb(0, 0, 128)", "rgb(128, 128, 128)", "rgb(0, 0, 0)"
  ];


export default props =>{


    const { unit,value, addresses, names, addressStates } = props;

    const graphData = React.useMemo(() =>{

        

        debugger;
        const dates = addressStates.flatMap(states => states.map(stat =>{
            var date;
            if (unit == "daily") date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
            if (unit == "weekly") {
                date = new Date(stat._id.year, 0, 1);
                date.setDate(stat._id.week * 7);
            }
            if (unit == "monthly") date = new Date(stat._id.year, stat._id.month - 1, 1);
            if (unit == "yearly") date = new Date(stat._id.year, 0, 1);

            return date;
        }));


        const labels = dates.map(date =>{
            return date;
        });

        const datasets = addressStates.map((states, pos) =>{

            return {
				label: 'Dataset ' + pos,
				backgroundColor: payOutsLineColours[pos % payOutsLineColours.length],
				stack: 'Stack 1',
				data: states.map(stat => value == "sum" ? stat.value : stat.count)
			}

        })

       return {
		labels: labels,
		datasets:datasets
	   };

    },[unit,value, addressStates]);


    var graphUnit = "week";

    if (unit == "daily") graphUnit = "day";
    if (unit == "weekly") graphUnit = "week";
    if (unit == "monthly") graphUnit = "month";
    if (unit == "yearly") graphUnit = "year";


    var options = {
      title: {
        text: 'Maternode Payouts'
      },
      scales: {
          xAxes: [{
              type: 'time',
              time: {
                  unit: graphUnit
              }
          }],
          yAxes: [{
              scaleLabel: {
                  display: true,
                  labelString: 'Payouts'
              }
          }]
      }
    };

    return (
        <Bar data={graphData} options={options} />
    )


}




var PayOutStatsToDataSetData = (stats, unit, value) =>{

    var data = [];
    var lastDate = null;
    for (var i = 0; i < stats.length; i++) {
      var stat = stats[i];
      var date = null;
  
  
      if (unit == "daily") date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
      if (unit == "weekly") {
          date = new Date(stat._id.year, 0, 1);
          date.setDate(stat._id.week * 7);
      }
      if (unit == "monthly") date = new Date(stat._id.year, stat._id.month - 1, 1);
      if (unit == "yearly") date = new Date(stat._id.year, 0, 1);
  
      if (lastDate != null) {
          var current = new Date(lastDate.getTime());
  
          if (unit == "daily") current.setDate(current.getDate() + 1);
          if (unit == "weekly") current.setDate(current.getDate() + 7);
          if (unit == "monthly") current.setMonth(current.getMonth() + 1);
          if (unit == "yearly") current.setFullYear(current.getFullYear() + 1);
  
  
  
  
          while (current < date) {
              data.push({
                  x: current,
                  y: 0
              });
  
              current = new Date(current.getTime());
              if (unit == "daily") current.setDate(current.getDate() + 1);
              if (unit == "weekly") current.setDate(current.getDate() + 7);
              if (unit == "monthly") current.setMonth(current.getMonth() + 1);
              if (unit == "yearly") current.setFullYear(current.getFullYear() + 1);
          }
      }
  
      data.push({
          x: date,
          y: value == "sum" ? stat.value : stat.count
      });
  
      lastDate = date;
    }
  
    return data;
  }