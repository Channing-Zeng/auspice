import React from "react";
import Radium from "radium";
// import _ from "lodash";
// import Flex from './framework/flex';
import { connect } from "react-redux";
// import { FOO } from "../actions";
// import { visualization } from "../../visualization/visualization";
import d3 from "d3";
import Link from "./branch";
import Node from "./node";
import Tooltip from "./tooltip";
import { processNodes } from "../../util/processNodes";
import * as globals from "../../util/globals";

const returnStateNeeded = (fullStateTree) => {
  return {
    metadata: fullStateTree.metadata,
    tree: fullStateTree.tree,
    sequences: fullStateTree.sequences,
    frequencies: fullStateTree.frequencies,
    controls: fullStateTree.controls
  };
};

@connect(returnStateNeeded)
@Radium
class Tree extends React.Component {
  constructor(props) {
    super(props);

    const tree = d3.layout.tree()
      .size([this.treePlotHeight(globals.width), globals.width]);
    const nodes = processNodes(tree.nodes(props.tree.tree));
    const links = tree.links(nodes);

    const xValues = nodes.map((d) => {
      return +d.xvalue;
    });

    const yValues = nodes.map((d) => {
      return +d.yvalue;
    });

    this.state = {
      width: globals.width,
      nodes,
      links,
      xScale: d3.scale.linear()
                      .domain([d3.min(xValues), d3.max(xValues)])
                      .range([globals.margin, globals.width - globals.margin]),
      yScale: d3.scale.linear()
                      .domain([d3.min(yValues), d3.max(yValues)])
                      .range([globals.margin, this.treePlotHeight(globals.width) - globals.margin])
    };
  }
  static propTypes = {
    /* react */
    // dispatch: React.PropTypes.func,
    params: React.PropTypes.object,
    routes: React.PropTypes.array,
    /* component api */
    style: React.PropTypes.object,
    controls: React.PropTypes.object,
    metadata: React.PropTypes.object,
    tree: React.PropTypes.object,
    sequences: React.PropTypes.object,
    frequencies: React.PropTypes.object
  }
  static defaultProps = {
    // foo: "bar"
  }
  componentDidMount() {
    // visualization(
    //   this.props.tree.tree,
    //   this.props.sequences.sequences,
    //   this.props.frequencies.frequencies,
    //   null /* todo: this is vaccineStrains */
    // )
  }
  getStyles() {
    return {
      base: {

      }
    };
  }
  treePlotHeight(width) {
    return 400 + 0.30 * width;
  }
  drawNodes(nodes) {
    const nodeComponents = nodes.map((node, index) => {
      return (
        <Node
          controls={this.props.controls}
          index={index}
          node={node}
          key={index}
          fill={this.props.controls.colorScale(node[this.props.controls.colorBy])}
          nuc_muts={node.nuc_muts}
          showBranchLabels={this.props.controls.showBranchLabels}
          strain={node.strain}
          hasChildren={node.children ? true : false}
          x={this.state.xScale(node.xvalue)}
          y={this.state.yScale(node.yvalue)}/>
      );
    });
    return nodeComponents;
  }
  drawBranches(links) {
    const branchComponents = links.map((link, index) => {
      return (
        <Link
          xscale={this.state.xScale}
          yscale={this.state.yScale}
          datum={link}
          key={index} />
      );
    });
    return branchComponents;
  }
  drawTooltip(node, type) {
    return (
      <Tooltip
        type={type}
        node={node}
        x={this.state.xScale(node.xvalue)}
        y={this.state.yScale(node.yvalue)}/>
    )
  }
  render() {
    const styles = this.getStyles();
    return (
      <div style={[
        styles.base,
        this.props.style
      ]}>
        <svg
          height={this.treePlotHeight(this.state.width)}
          width={this.state.width}
          id="treeplot"
          style={{
          }}>
          {this.drawBranches(this.state.links)}
          {this.drawNodes(this.state.nodes)}
          {
            this.props.controls.selectedBranch ?
            this.drawTooltip(this.props.controls.selectedBranch.target, "branch") :
            null
          }
          {
            this.props.controls.selectedNode ?
            this.drawTooltip(this.props.controls.selectedNode, "node") :
            null
          }
        </svg>
      </div>
    );
  }
}

export default Tree;
