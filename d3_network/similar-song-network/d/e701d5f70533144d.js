// https://observablehq.com/@srmourasilva/similar-song-network@160
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Similar Song Network

Songs similar to another music according to [last.fm](http://www.last.fm/api) are linked together. Song nodes are sized based on playcounts, and colored by artist.

Data from [last.fm](http://www.last.fm/api/show/track.getSimilar). Some songs include additional links for effect.<br/>Popular songs are defined as those with playcounts above the median for all songs in network. This example is a simpler version of the [tutorial](http://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/)</a> by [Jim Vallandingham](http://vallandingham.me/).

Artist name and music in root is **Lady Gaga - Poker Face**`
)});
  main.variable(observer("forceSimulation")).define("forceSimulation", ["d3"], function(d3){return(
(nodes, links) => 
  d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-50).distanceMax(270))
    .force("center", d3.forceCenter())
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","dataset","forceSimulation","drag"], function(d3,DOM,dataset,forceSimulation,drag)
{
  const width = 960
  const height = 800
  
  const svg = d3.select(DOM.svg(width, height))
                .attr("viewBox", [-width / 2, -height / 2, width, height])
  
  // Configure os nodes e os links
  const nodes = dataset.nodes
  const links = dataset.links

  //Crie os elementos svg para os links e guarde-os em link
  const link = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
      .append('line')
      .attr('class', 'link')
  
  //Crie os elementos svg para os nodes e guarde-os em node
  const scale = d3.scaleSqrt()
    .range([2, 20])
    .domain(d3.extent(nodes, d => d.playcount))
  
  const node = svg
    .append('g')
    .selectAll('circle')
    .data(nodes)
    .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => scale(d.playcount))
    
  // Defina a função ticked
  const ticked = () => {
    // como obter o novo x1 a partir do elemento d?
    console.log(link)
    link.attr("x1", (d) => d.source.x)
    link.attr("y1", (d) => d.source.y)
    link.attr("x2", (d) => d.target.x)
    link.attr("y2", (d) => d.target.y)

    node.attr("cx", (d) => d.x)
    node.attr("cy", (d) => d.y)
  }
  
  node.append('title')
    .text(d => `${d.artist}: ${d.name}`)
  
  node.on("mouseenter", (d, i, nodes) => {
      d3.select(nodes[i]).attr('fill', 'red')
    })
    .on("mouseout", (d, i, nodes) => {
      d3.select(nodes[i]).attr('fill', 'black')
    })

  // Crie a constante simulation usando a função forceSimulation definida em outra célula
  const simulation = forceSimulation(nodes, links).on("tick", ticked)
  node.call(drag(simulation))
  
  // Once we append the vis elments to it, we return the DOM element for Observable to display above.
  return svg.node()
}
);
  main.variable(observer("drag")).define("drag", ["d3"], function(d3){return(
(simulation) => {
  const dragstarted = (d) => {
    if (!d3.event.active)
      simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }
  const dragged = (d) => {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }
  const dragended = (d) => {
    if (!d3.event.active)
      simulation.alphaTarget(0)
    d.fx = null    
    d.fy = null       
  }         
  return d3.drag()      
    .on("start", dragstarted)   
    .on("drag", dragged)          
    .on("end", dragended)
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>
line.link {
  fill: none;
  stroke: #ddd;
  stroke-opacity: 0.8;
  stroke-width: 1.5px;
}
.tooltip {
  fill: blue;
}
<style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.json('https://gist.githubusercontent.com/emanueles/7b7723386677bb13763208216fd89c1f/raw/d09478158ba0fe8aa616deee8bcfe908bba17f15/songs.json')
)});
  return main;
}
