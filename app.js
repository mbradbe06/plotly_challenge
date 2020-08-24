//default plot for page with subject 940 info
function init() {
    d3.json('../samples.json').then(data => {
        // console.log(data.samples[0]);
        
        //locate test subject 940 and create h-bar-chart with sample_values as values for chart
        //and out_id: genus as chart labels
        //first filter to locate sample info for subject 940
        const sampleSelection = data.samples.filter(sample => sample.id === '940')[0];
          // console.log(sampleSelection);
        
        //get top 10 OTUs
        const sampleValues = sampleSelection.sample_values.slice(0,10);
          // console.log(sampleValues);
        
        //bring together otu-id and genus into y-label
        const idLabels = sampleSelection.otu_ids.map( (otu,i) => {
          let idLabelsObj = {id: otu,
                            labels: sampleSelection.otu_labels[i]};
          return idLabelsObj                  
        });
          // console.log(idLabels);
        
        const topIdLabels = idLabels.slice(0,10);
          // console.log(topIdLabels);
        const yGenus =  topIdLabels.map( d => {
            let genus = d.labels.split(';');
            return `${d.id}: ${genus[genus.length-1]}`
          });
        
        //format into horizontal bar chart  
        const trace = {
            x: sampleValues.reverse(),
            y: yGenus.reverse(),
            type : 'bar',
            orientation : 'h'
          };
      
        const layout = {
            title : 'Top 10 Bacteria - Selected Subject',
            xaxis : {automargin:true},
            yaxis : {automargin:true,
                     tickfont : {size:10}
                    }
          };
      
        Plotly.newPlot("bar1", [trace], layout);
          
      });
      
      //aggregate bar chart of 
      d3.json('../samples.json').then(data => {
      
        const otuCounts = data.samples.map( d => d.sample_values.map(d => d)).flat();
      
        const otuLabels = data.samples.map( d => d.otu_labels.map( d => d)).flat();
        const otuIds = data.samples.map( d => d.otu_ids.map(d => d)).flat();
       
        const otuCombo = [];
         otuCounts.forEach( (d,i) => {
           let otuCombObj = {};
           otuCombObj.id = otuIds[i];
           otuCombObj.label = otuLabels[i];
           otuCombObj.count = d;
           otuCombo.push(otuCombObj);
         });
         
        // console.log(otuCombo);
      
        const otuIdsUnique = Array.from(new Set(otuIds));
        // console.log(otuIdsUnique);
        // const otuLabelsUnique = Array.from(new Set(otuLabels));
        // console.log(otuLabelsUnique);
        
        const finalCounts = []
        otuIdsUnique.forEach( (d,i) => {
          let otuSumObj = {};
          otuSumObj.id = d;
          let filterValues = []; 
          filterValues.push(otuCombo.filter( data => data.id === otuSumObj.id ));
          // console.log(filterValues); 
          let totalCount=[];
          const genusGrab = [];
          filterValues.forEach( (d,i) => {
            d.map( d => {
              totalCount.push(d.count);
              let genus = d.label.split(';');
              genusGrab.push(genus[genus.length - 1]);
      
            })
          })
          // console.log(genusGrab);
          otuSumObj.count = totalCount.reduce((a,b) => a+b);
          otuSumObj.genus = genusGrab[0];
          finalCounts.push(otuSumObj);
          })
        
        const finalSort = finalCounts.sort( (a,b) => b.count - a.count);
      
        const topAggFinal = finalSort.slice(0,10);
        // console.log(topAggFinal.map(d=> d.count));
      
          //format into horizontal bar chart  
        const trace = {
            x: topAggFinal.map(d=> d.count).reverse(),
            y: topAggFinal.map(d=> `${d.id}: ${d.genus}`).reverse(),
            type : 'bar',
            orientation : 'h'
          };
      
          const layout = {
            title : 'Top 10 Bacteria - All Subjects',
            xaxis : {automargin:true},
            yaxis : {automargin:true,
                     tickfont : {size:10}},
            
          };
      
        Plotly.newPlot("bar2", [trace], layout);
      
        });
      
      d3.json('../samples.json').then(data => {
          
          //locate test subject 940 and create bubble chart with agg sample_values as values for chart
          //and out_family agg as y-labels
          //first filter to locate sample info for subject 940
        const sampleSelection = data.samples.filter(sample => sample.id === '940')[0];
          //generate family otu_labels
        const getFamily = sampleSelection.otu_labels.map( d => d.split(';'));
        // console.log(getFamily);
        const family = getFamily.map( (d,i) => d.slice(0, getFamily[i].length - 1).join(','));
      
        // console.log(family);
      
        const familyValues = [];
        family.forEach( (d,i) =>{
          let familyValObj = {};
          familyValObj.family = d;
          familyValObj.count = sampleSelection.sample_values[i];
          familyValues.push(familyValObj);
        });
      
        // console.log(familyValues);
      
        const FamUnique = Array.from(new Set(family));
        
        // console.log(FamUnique);
      
        const finalFamCounts = [];
        FamUnique.forEach( (d,i) => {
          let FamValObj = {};
          FamValObj.family = d;
          let filterValues = []; 
          filterValues.push(familyValues.filter( data => data.family === FamValObj.family ));
          // console.log(filterValues); 
          let totalCount=[];
          filterValues.forEach( (d,i) => {
            d.map( d => {
              totalCount.push(d.count);   
            });  
          })
          FamValObj.count = totalCount.reduce((a,b) => a+b);
          finalFamCounts.push(FamValObj);
        });
      
        const xValues = finalFamCounts.map( d=> d.count)
        // console.log(xValues);
      
        const trace1 = {
          x: xValues,
          y: finalFamCounts.map( d => d.family),
          mode: 'markers',
          marker: {
            size: xValues,
            sizemode: 'area'
            }
          };
          
        var layout = {
          title: 'Count of Bacteria by Family - Selected Subject',
          margin :{l : 450},
          yaxis : {tickfont : {size:10}},
          };
          
          Plotly.newPlot('bubble', [trace1], layout);  
      });
      
      
      //populate Demographic Info table
      function buildInfo() {
        d3.json('../samples.json').then(data => { 
          const metaData = data.metadata.filter(data => data.id.toString() === '940')[0];
          // console.log(metaData);
          let keys = Object.keys(metaData).map( d => d );
          // console.log(keys);
          let values = Object.values(metaData).map( v => v);
          // console.log(values);
          const Info = d3.select("#sample-metadata")
                         .append('div')
                         .classed('panel-body',true)
          for (i=0; i < 7; i++) {
            Info.append('p')
                .html(`<b>${keys[i].toUpperCase()}</b> : ${values[i]}`);
          }    
        });
      }
      
      
      buildInfo();

}
//read in data again
d3.json('../samples.json').then((data,i) => {
//create dropdown menu and options
  const subjects = data.names;
  const dropDownOptions = d3.select('#selDataset');
    for (i=0; i < subjects.length; i++) {
        dropDownOptions.append('option')
                       .attr('value', i)
                       .html(`${subjects[i]}`);
            }
    d3.selectAll('#selDataset').on('change',updatePlotly);       

    function updatePlotly(){
        const dropDownSelection = d3.select('#selDataset')
                                    .property('value');
        console.log(dropDownSelection);                            

        const sampleSelection = data.samples[dropDownSelection];
        console.log(sampleSelection);
      
        //get top 10 OTUs
        const sampleValues = sampleSelection.sample_values.slice(0,10);
        console.log(sampleValues);
      
        //bring together otu-id and genus into y-label
        const idLabels = sampleSelection.otu_ids.map( (otu,i) => {
            let idLabelsObj = {id: otu,
                          labels: sampleSelection.otu_labels[i]};
            return idLabelsObj                  
        });
        // console.log(idLabels);
      
        const topIdLabels = idLabels.slice(0,10);
        // console.log(topIdLabels);
        const yGenus =  topIdLabels.map( d => {
          let genus = d.labels.split(';');
          return `${d.id}: ${genus[genus.length-1]}`
        });
        
        let x = sampleValues.reverse();
        let y = yGenus.reverse();
    
        Plotly.restyle("bar1", "x", [x]);
        Plotly.restyle("bar1", "y", [y]);

        const getFamily = sampleSelection.otu_labels.map( d => d.split(';'));
        // console.log(getFamily);
        const family = getFamily.map( (d,i) => d.slice(0, getFamily[i].length - 1).join(','));
      
        // console.log(family);
      
        const familyValues = [];
        family.forEach( (d,i) =>{
          let familyValObj = {};
          familyValObj.family = d;
          familyValObj.count = sampleSelection.sample_values[i];
          familyValues.push(familyValObj);
        });
      
        // console.log(familyValues);
      
        const FamUnique = Array.from(new Set(family));
        
        console.log(FamUnique);
      
        const finalFamCounts = [];
        FamUnique.forEach( (d,i) => {
          let FamValObj = {};
          FamValObj.family = d;
          let filterValues = []; 
          filterValues.push(familyValues.filter( data => data.family === FamValObj.family ));
          // console.log(filterValues); 
          let totalCount=[];
          filterValues.forEach( (d,i) => {
            d.map( d => {
              totalCount.push(d.count);   
            });  
          })
          FamValObj.count = totalCount.reduce((a,b) => a+b);
          finalFamCounts.push(FamValObj);
        });
          console.log(finalFamCounts.family);
      
        const xValues = finalFamCounts.map( d=> d.count)
        console.log(xValues);
      
        const trace1 = {
          x: xValues,
          y: finalFamCounts.map( d => d.family),
          mode: 'markers',
          marker: {
            size: xValues,
            sizemode: 'area'
            }
          };
          
        var layout = {
          title: 'Count of Bacteria by Family - Selected Subject',
          margin :{l : 450},
          yaxis : {tickfont : {size:10}},
          };

          Plotly.newPlot('bubble', [trace1], layout);

        // let Info = d3.select("#sample-metadata")
        //              .html()

    //   populate Demographic Info table
    //   function updateInfo() {
          const metaData = data.metadata[dropDownSelection];
          // console.log(metaData);
          let keys = Object.keys(metaData).map( d => d );
          // console.log(keys);
          let values = Object.values(metaData).map( v => v);
          // console.log(values);
          d3.select('#sample-metadata')
                             .html('')
          
          const Info = d3.select("#sample-metadata")
                         .append('div')
                         .classed('panel-body',true)
                   
          for (i=0; i < 7; i++) {
            Info.append('p')
                .html(`<b>${keys[i].toUpperCase()}</b> : ${values[i]}`);
          }    
        };
      
      
      
    //   updateInfo();
         
    
    // }
             
});



init();