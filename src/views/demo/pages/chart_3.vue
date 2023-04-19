<template>
  <div class="layout-flex column">
    <div class="layout-flex-s pb-xs">
      <el-radio-group v-model="activeName"
                      size="small">
        <el-radio-button v-for="item in tabsList"
                         :key="item.name"
                         :label="item.label">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="layout-flex-l">
      <div class="chart"
           id="chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from 'axios'
import { getUuid } from '@/utils/uuid'

export default {
  name: 'Chart',
  data () {
    return {
      dataUrl: 'static/data/data_3.json',
      data: {},
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
      ]
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
      const chartDom = document.getElementById('chart')
      const myChart = echarts.init(chartDom)
      myChart.showLoading()

      const res = await axios.get(this.dataUrl)
      const { data } = res
      this.data = this.filterData(data)

      const formatUtil = echarts.format
      const option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: function (info) {
            var treeAncestors = info.treeAncestors
            var treePath = []
            for (var i = 1; i < treeAncestors.length; i++) {
              treePath.push(treeAncestors[i].name)
            }
            return [
              '<div class="tooltip-title">' +
              formatUtil.encodeHTML(treePath.join(' > ')) +
              '</div>'
            ].join('')
          }
        },
        series: {
          type: 'tree',
          data: [this.filterLayer(this.data, 2)],
          roam: true,
          top: '1%',
          left: '7%',
          bottom: '1%',
          right: '20%',
          symbolSize: 7,
          // initialTreeDepth: 2,
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },
          emphasis: {
            focus: 'relative'
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      }

      myChart.setOption(option)
      myChart.hideLoading()
      myChart.on('finished')
      myChart.on('click', (params) => {
        const currentData = myChart.getOption().series[0].data[0]
        const { treeAncestors, data } = params
        if (treeAncestors && treeAncestors.length > 0) {
          let newData = { ...currentData }
          treeAncestors.forEach((item, index) => {
            if (data.children && data.children.length > 0) {
              // collapsed
              newData = this.handleItemCollapsed(newData, item.name, index, treeAncestors.length)
            } else {
              // selected
              newData = this.handleItemSelected(newData, item.name, index, data.selected)
            }
          })
          myChart.setOption({
            series: {
              data: [newData]
            }
          })
        }
      })
    },
    filterData (data = {}, layer = 0) {
      const { name = '', children = [] } = data

      const result = {
        name: name.replace('<br>', ' | '),
        chartId: `chart-${getUuid()}`,
        chartLayer: layer,
        children: children && children.map(item => {
          return this.filterData(item, layer + 1)
        })
      }
      return result
    },
    filterLayer (data = {}, layer) {
      if (!layer) {
        return data
      } else {
        const { children = [], chartLayer, ...other } = data
        const result = {
          ...other,
          collapsed: chartLayer >= layer,
          chartLayer,
          children: children && children.map((item) => {
            return this.filterLayer(item, layer)
          })
        }
        return result
      }
    },
    handleItemCollapsed (data = {}, itemName, itemIndex, targetLength) {
      const { children = [], name, chartLayer, ...other } = data
      const result = {
        name,
        chartLayer,
        ...other,
        children: children && children.map(item => {
          return this.handleItemCollapsed(item, itemName, itemIndex, targetLength)
        })
      }
      if (itemIndex === chartLayer + 1) {
        if (!result.selected) {
          if (targetLength === itemIndex + 1) {
            result.collapsed = name !== itemName ? true : !result.collapsed
          } else {
            result.collapsed = name !== itemName
          }
        }
      }
      return result
    },
    handleItemSelected (data = {}, itemName, itemIndex, isSelected) {
      const { children = [], name, chartLayer, ...other } = data
      const result = {
        name,
        chartLayer,
        ...other,
        children: children && children.map(item => {
          return this.handleItemSelected(item, itemName, itemIndex, isSelected)
        })
      }
      if (itemIndex === chartLayer + 1) {
        if (itemName === name) {
          if (isSelected) {
            result.selected = false
            result.lineStyle = {}
            result.label = {}
          } else {
            result.selected = true
            result.lineStyle = {
              color: '#38ab00'
            }
            result.label = {
              color: '#004e9f',
              fontWeight: 'bold',
              fontSize: 12,
              backgroundColor: '#fff'
            }
          }
        }
      }
      return result
    },
    handleClick (params) {
      console.log(params)
    }
  }
}
</script>
