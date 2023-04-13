<template>
  <div class='layout-flex column'>
    <div class='layout-flex-s pb-xs'>
      <el-radio-group v-model='activeName'
                      size='small'>
        <el-radio-button v-for='item in tabsList'
                         :key='item.name'
                         :label='item.label'>
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class='layout-flex-l'>
      <div class="layout-flex align-center justify-center">
        <div class='chart'
             style="width: 80vw; height: 80vh;"
             id='chart'></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'

export default {
  name: 'Chart',
  data () {
    return {
      dataUrl: 'static/data/data_1.json',
      activeName: '党群工作部',
      tabsList: [
        {
          label: '党群工作部',
          name: '1',
          url: 'static/data/data_1.json'
        },
        {
          label: '整体管理',
          name: '2',
          url: 'static/data/data_2.json'
        },
        {
          label: '公司地图',
          name: '3',
          url: 'static/data/data_3.json'
        }
      ],
      data: {},
      width: 960,
      height: 700
    }
  },
  watch: {
    activeName (val) {
      this.dataUrl = this.tabsList.find(item => item.label === val).url
      this.initChart()
    }
  },
  mounted () {
    this.initChart()
  },
  methods: {
    async initChart () {
      const res = await axios.get(this.dataUrl)
      this.data = this.filterData(res.data)
      const chartDom = document.getElementById('chart')
      this.width = chartDom.clientWidth
      this.height = chartDom.clientHeight
      const svg = this.chart()
      chartDom.innerHTML = ''
      chartDom.append(svg)
    },
    filterData (data) {
      const { name, children = [] } = data
      return {
        name: name.replace('<br>', '\n'),
        children: children && children.map((item) => this.filterData(item)),
        value: children && children.length > 0 ? null : 1
      }
    },
    partition (data) {
      const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value)
      return d3.partition()
        .size([this.height, (root.height + 1) * this.width / 3])(root)
    },
    chart () {
      const _this = this
      const root = this.partition(_this.data)
      let focus = root
      const format = d3.format(',d')
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, _this.data.children.length + 1))

      const svg = d3.create('svg')
        .attr('viewBox', [0, 0, _this.width, _this.height])
        .style('font', '10px sans-serif')

      const cell = svg
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', d => `translate(${d.y0},${d.x0})`)

      const rect = cell.append('rect')
        .attr('width', d => d.y1 - d.y0 - 1)
        .attr('height', d => rectHeight(d))
        .attr('fill-opacity', 0.6)
        .attr('fill', d => {
          if (!d.depth) return '#ccc'
          while (d.depth > 1) d = d.parent
          return color(d.data.name)
        })
        .style('cursor', 'pointer')
        .on('click', clicked)

      const text = cell.append('text')
        .style('user-select', 'none')
        .attr('pointer-events', 'none')
        .attr('x', 4)
        .attr('y', 13)
        .attr('fill-opacity', d => +labelVisible(d))

      text.append('tspan')
        .text(d => d.data.name)

      const tspan = text.append('tspan')
        .attr('fill-opacity', d => labelVisible(d) * 0.7)
        .text(d => ` ${format(d.value)}`)

      cell.append('title')
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join('/')}\n${format(d.value)}`)

      function clicked (event, p) {
        focus = focus === p ? p = p.parent : p

        root.each(d => {
          d.target = {
            x0: (d.x0 - p.x0) / (p.x1 - p.x0) * _this.height,
            x1: (d.x1 - p.x0) / (p.x1 - p.x0) * _this.height,
            y0: d.y0 - p.y0,
            y1: d.y1 - p.y0
          }
        })

        const t = cell.transition().duration(750)
          .attr('transform', d => `translate(${d.target.y0},${d.target.x0})`)

        rect.transition(t).attr('height', d => rectHeight(d.target))
        text.transition(t).attr('fill-opacity', d => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', d => labelVisible(d.target) * 0.7)
      }
      function rectHeight (d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)
      }

      function labelVisible (d) {
        return d.y1 <= _this.width && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      return svg.node()
    }
  }
}
</script>
