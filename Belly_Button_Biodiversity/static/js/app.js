function buildMetadata(sample) {

  // Execute the sample_metadata function with "argument" of sample
  // This is returned as a JSON object. Convert it to arrays that can
  // be used to construct the necessary strings to update the metadata 
  // panel. 

  url = "/metadata/" + sample;

  d3.json(url).then(function(response) {
    entries=Object.entries(response);
    mdtable = d3.select("#sample-metadata")
    mdtable.html("");
    entries.forEach(entry => {
      mdtable.insert("p").text(entry[0] + ": " + entry[1]);
    });
      
    
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildCharts(sample) {
  console.log("builtCharts")

  url = "/samples/" + sample;
  d3.json(url).then(function(response) {
    console.log(response);
    console.log(response.otu_ids);

    var bubbletrace = {
      x : response.otu_ids,
      y : response.sample_values,
      mode: 'markers', 
      type: 'scatter',
      text: response.otu_labels, 
      marker: {
        size : response.sample_values, 
        color: response.otu_ids
      }
    };

    var bubblelayout = {
      title: 'Samples by OTU',
      showlegend: false,
    };

    plotdata = [bubbletrace];
    Plotly.newPlot("bubble", plotdata, bubblelayout);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    datatable=Object.entries(response);
    // Get the data into arrays so sort and slice will work more easily
    var dataarray=[];
    datatable.forEach(function(entry, i) {
      dataarray.push(datatable[i][1]);
    });
    // Go from 3xN array to Nx3 array so we can sort it right
    var rdataarray = [];
    for (i=0; i < dataarray[2].length; i++) {
      rdataarray.push([dataarray[0][i], dataarray[1][i], dataarray[2][i]]);
    };
    console.log("UNSORTED", rdataarray);
    // Sort the 3 x N array based on values in the sample_values array
    rdataarray.sort(function(a, b) { return b[2] - a[2] });
    console.log("SORTED", rdataarray);

    // Slice out the top 10 by sample_values
    var topvalues = rdataarray.slice(0, 10);

  
    console.log(topvalues);

    var pietrace = {
      values : topvalues[2],
      labels : topvalues[0],
      hovertext : topvalues[1], 
      textinfo : "percent",
      type: "pie"
    };

    plotdata = [pietrace];
    Plotly.newPlot("pie", plotdata);


  });


  
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
