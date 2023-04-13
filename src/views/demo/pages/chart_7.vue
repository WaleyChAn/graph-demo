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
             style="width: 80vh; height: 80vh;"
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
      chartDom.innerHTML = ''
      const svg = this.chart()
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
        .sort((a, b) => b.value - a.value)
      return d3.partition()
        .size([2 * Math.PI, root.height + 1])(root)
    },
    chart () {
      const _this = this
      const radius = _this.width / 6

      const root = this.partition(_this.data)
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, _this.data.children.length + 1))
      const format = d3.format(',d')
      const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

      root.each(d => {
        d.current = d
      })

      const svg = d3.create('svg')
        .attr('viewBox', [0, 0, _this.width, _this.width])
        .style('font', '10px sans-serif')

      const g = svg.append('g')
        .attr('transform', `translate(${_this.width / 2},${_this.width / 2})`)

      const path = g.append('g')
        .selectAll('path')
        .data(root.descendants().slice(1))
        .join('path')
        .attr('fill', d => {
          while (d.depth > 1) {
            d = d.parent
          }
          return color(d.data.name)
        })
        .attr('fill-opacity', d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr('pointer-events', d => arcVisible(d.current) ? 'auto' : 'none')

        .attr('d', d => arc(d.current))

      path.filter(d => d.children)
        .style('cursor', 'pointer')
        .on('click', clicked)

      path.append('title')
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join('/')}\n${format(d.value)}`)

      const label = g.append('g')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .style('user-select', 'none')
        .selectAll('text')
        .data(root.descendants().slice(1))
        .join('text')
        .attr('dy', '0.35em')
        .attr('fill-opacity', d => +labelVisible(d.current))
        .attr('transform', d => labelTransform(d.current))
        .text(d => d.data.name)

      const parent = g.append('circle')
        .datum(root)
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('click', clicked)

      function clicked (event, p) {
        parent.datum(p.parent || root)

        root.each(d => {
          d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
          }
        })

        const t = g.transition().duration(750)

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
          .tween('data', d => {
            const i = d3.interpolate(d.current, d.target)
            return t => {
              d.current = i(t)
            }
          })
          .filter(function (d) {
            return +this.getAttribute('fill-opacity') || arcVisible(d.target)
          })
          .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attr('pointer-events', d => arcVisible(d.target) ? 'auto' : 'none')

          .attrTween('d', d => () => arc(d.current))

        label.filter(function (d) {
          return +this.getAttribute('fill-opacity') || labelVisible(d.target)
        }).transition(t)
          .attr('fill-opacity', d => +labelVisible(d.target))
          .attrTween('transform', d => () => labelTransform(d.current))
      }

      function arcVisible (d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
      }

      function labelVisible (d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
      }

      function labelTransform (d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI
        const y = (d.y0 + d.y1) / 2 * radius
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
      }

      return svg.node()
    }
  }
}
</script>
