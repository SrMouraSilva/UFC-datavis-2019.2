// https://observablehq.com/@srmourasilva/les-miserables@215
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Les miserables`
)});
  main.variable(observer("forceSimulation")).define("forceSimulation", ["d3"], function(d3){return(
(nodes, links) => 
  d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-50).distanceMax(370))
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
  //const elements = {
  //const count = (d) => link.filter(d2 => d.id == d2.source.id).count()
  
  const sizeNodes = {}
  
  nodes.forEach(d => {
    sizeNodes[d.id] = 0
  })
  links.forEach(d => {
    sizeNodes[d.source.id] += 1
    sizeNodes[d.target.id] += 1
  })
  
  const scale = d3.scaleSqrt()
    .range([1, 20])
    .domain(d3.extent(nodes, d => sizeNodes[d.id]))
  
  const node = svg
    .append('g')
    .selectAll('circle')
    .data(nodes)
    .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('fill', 'blue')
      .attr('r', d => scale(sizeNodes[d.id]))
    
  // Defina a função ticked
  const ticked = () => {
    // como obter o novo x1 a partir do elemento d?
    link.attr("x1", (d) => d.source.x)
    link.attr("y1", (d) => d.source.y)
    link.attr("x2", (d) => d.target.x)
    link.attr("y2", (d) => d.target.y)

    node.attr("cx", (d) => d.x)
    node.attr("cy", (d) => d.y)
  }
  
  node.append('title')
    .text(d => `${d.id}: ${sizeNodes[d.id]} conexões`)
  
  node.on("mouseenter", (d, i, nodes) => {
      d3.select(nodes[i]).attr('fill', 'red')
    })
    .on("mouseout", (d, i, nodes) => {
      d3.select(nodes[i]).attr('fill', 'blue')
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
d3.json('https://gist.githubusercontent.com/emanueles/1dc73efc65b830f111723e7b877efdd5/raw/2c7a42b5d27789d74c8708e13ed327dc52802ec6/lesmiserables.json')
)});
  return main;
}
