import React from 'react';
import dataset from '../assets/dataset.json';
import CanvasJSChart from '../assets/canvasjs.react';
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const inputs = [
  "Polymer 1",
  "Polymer 2",
  "Polymer 3",
  "Polymer 4",
  "Carbon Black High Grade",
  "Carbon Black Low Grade",
  "Silica Filler 1",
  "Silica Filler 2",
  "Plasticizer 1",
  "Plasticizer 2",
  "Plasticizer 3",
  "Antioxidant",
  "Coloring Pigment",
  "Co-Agent 1",
  "Co-Agent 2",
  "Co-Agent 3",
  "Curing Agent 1",
  "Curing Agent 2",
  // Oven Temperature included in the tooltip but not in the stacked bar chart
]

let indexCount = 0;

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      indexLabel: {},
      options: {},
    };
  }

  updateTitle(output) {
    let newTitle = output + " Chart";
    this.setState({ title: newTitle });
  }

  compare(a, b) {
    return b[1] - a[1];
  }

  sortData(output) {
    let sorted = [];
    for (let exp in dataset) {
      sorted.push([exp, dataset[exp]["outputs"][output]]);
    }
    sorted.sort(this.compare);
    return sorted;
  }

  createIndexLabel(e, output) {
    let dataset_len = Object.keys(dataset).length;
    let idx = inputs.length * dataset_len;
    if (indexCount < idx - dataset_len) {
      indexCount++;
      return "";
    } else {
      indexCount++;
      if (indexCount == idx) {
        indexCount = 0;
      }
      let label = e.dataPoint.label;
      return dataset[label]["outputs"][output];
    }
  }

  createDataPoints(input, output, sorted) {
    let sortedDataPoints = [];
    for (let exp of sorted) {
      sortedDataPoints.push({
        label: exp[0],
        y: dataset[exp[0]]["inputs"][input]
      })
    }
    return {
      type: "stackedBar",
      name: input,
      showInLegend: "true",
      indexLabelFormatter: e => {
        return this.createIndexLabel(e, output);
      },
      indexLabelPlacement: "outside",  
      indexLabelOrientation: "horizontal",
      indexLabelFontSize: 12,
      dataPoints: sortedDataPoints
    };
  }

  updateData(output) {
    let newData = [];
    let sorted = this.sortData(output);
    for (let input of inputs) {
      newData.push(this.createDataPoints(input, output, sorted));
    }
    this.setState({ data: newData });

    return newData;
  }

  updateOptions(output) {
    this.updateTitle(output);
    let newData = this.updateData(output);
    this.setState({ 
      options: {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2",
        height: 600,
        axisX: {
          title: "Experiment",
          titleFontSize: 24,
          labelFontSize: 12,
          labelFormatter: e => {
            if (e.label) {
              return e.label.substring(e.label.indexOf("EXP"));
            } else {
              return e.label;
            }
          },
          interval: 1,
        },
        axisY: {
          title: "Amount of Inputs",
          titleFontSize: 24,
          labelFontSize: 12,
        }, 
        toolTip: {
          shared: true,
          contentFormatter: e => {
            let exp = e.entries[0].dataPoint.label;
            let content = "<i>" + exp + "</i><br/>";
            for (let i = 0; i < e.entries.length; i++) {
              content += e.entries[i].dataSeries.name + ": <strong>" + e.entries[i].dataPoint.y + "</strong>";
              content += "<br/>";
            }
            content += "Oven Temperature: <strong>" + dataset[exp]["inputs"]["Oven Temperature"] + "</strong>";
            return content;
          }
        },
        legend:{
          cursor: "pointer",
          fontSize: 12,
        },
        data: newData
      }
    });
  }

  componentDidMount() {
    this.updateOptions("Viscosity");
  }

  componentDidUpdate() {

  }

  render() {
    return (
      <div className="chart">
        <header>
          <h1>{ this.state.title }</h1>
        </header>
        <div className="inputs">
          <button onClick={() => this.updateOptions("Viscosity")}>Viscosity</button>
          <button onClick={() => this.updateOptions("Cure Time")}>Cure Time</button>
          <button onClick={() => this.updateOptions("Elongation")}>Elongation</button>
          <button onClick={() => this.updateOptions("Tensile Strength")}>Tensile Strength</button>
          <button onClick={() => this.updateOptions("Compression Set")}>Compression Set</button>
        </div>
        <div id="chartContainer">
          <CanvasJSChart options={ this.state.options } onRef={ref => this.chart = ref} />
        </div>
      </div>
    )
  }
}

export default Chart