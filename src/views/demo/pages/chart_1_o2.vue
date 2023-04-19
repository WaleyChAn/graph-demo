<template>
  <div class="layout-flex column">
    <div class="layout-flex-s pb-xs">
      <div class="layout-flex align-center justify-center ">
        <div class="layout-flex-s">
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
          <div class="layout-flex align-center"
               style="justify-content: right;">
            <span v-for="(item, index) in dataPath"
                  :key="item.constId"
                  @click="handleCrumbsClick(item)"
                  style="cursor: pointer; font-size: 14px;">
              <i v-if="index > 0"
                 class="el-icon-arrow-right"></i>
              {{ item.name }}
            </span>
          </div>
        </div>
        <div class="layout-flex-s">
          <div class="layout-flex justfiy-center pl-xs">
            <i class="el-icon-location-outline"></i>
          </div>
        </div>
      </div>
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
// import { v4 as uuidv4 } from 'uuid'
import { getUuid } from '@/utils/uuid'

export default {
  name: 'Chart',
  data () {
    return {
      myChart: null,
      dataUrl: 'static/data/data_1.json',
      data: {},
      dataPath: [],
      isFilterStop: false,
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
      this.myChart = echarts.init(chartDom)
      this.myChart.showLoading()

      const { data } = await axios.get(this.dataUrl)
      this.data = this.filterData(data)

      const filterLayer = this.filterLayer(this.data, 2)
      const { children, ...other } = filterLayer

      this.dataPath = [other]
      const option = {
        series: {
          type: 'sunburst',
          data: filterLayer.children,
          // nodeClick: false,
          radius: ['10%', '80%'],
          sort: undefined,
          itemStyle: {
            // borderRadius: 7,
            borderWidth: 2
          },
          emphasis: {
            focus: 'ancestor'
          }
        }
      }

      this.myChart.setOption(option)
      this.myChart.on('click', this.handleChartClick)
      this.myChart.hideLoading()
    },
    handleChartClick (params) {
      const { chartId } = params.data
      const data = this.filterTarget(this.data, chartId)
      if (data) {
        const { children, ...other } = data
        if (children && children.length > 0) {
          this.dataPath.push(other)
          this.setChartByTarget(data)
        }
      }
    },
    handleCrumbsClick (params) {
      const { chartId } = params
      const data = this.filterTarget(this.data, chartId)
      const index = this.dataPath.findIndex(item => item.chartId === chartId)
      if (index === this.dataPath.length - 1) {
        return false
      } else {
        if (data) {
          const { children } = data
          if (children && children.length > 0) {
            this.dataPath = this.dataPath.slice(0, index + 1)
            this.setChartByTarget(data)
          }
        }
      }
    },
    setChartByTarget (data) {
      const { chartLayer } = data
      const filterLayer = this.filterLayer(data, chartLayer + 2)
      this.myChart.setOption({
        series: {
          data: filterLayer.children
        }
      })
    },
    filterData (data = {}, layer = 0) {
      const { name = '', children = [], procedureId } = data

      const result = {
        name: name.replace('<br>', '\n'),
        chartId: `chart-${getUuid()}`,
        chartLayer: layer,
        procedureId,
        children: children && children.map(item => {
          return this.filterData(item, layer + 1)
        })
      }
      if (children && children.length === 0 && procedureId) {
        result.value = 1
        result.label = {
          position: 'outside',
          padding: 3,
          silent: false
        }
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
          chartLayer
        }
        if (chartLayer < layer) {
          if (children && children.length > 0) {
            result.children = children.map(item => {
              return this.filterLayer(item, layer)
            })
          }
        } else {
          result.value = children && children.length > 0 ? children.length : 1
          if (result.procedureId) {
            result.label = {
              position: 'outside',
              padding: 3,
              silent: false
            }
          }
        }
        return result
      }
    },
    filterTarget (data = {}, id) {
      const { children = [], chartId } = data
      let result = null
      if (chartId === id) {
        result = {
          ...data
        }
      } else if (children) {
        children.forEach(item => {
          const target = this.filterTarget(item, id)
          if (target) {
            result = target
          }
        })
      }
      return result
    },
    getChildren (data, layer) {
      var hasFound = false
      var result = null
      var fn = function (data) {
        if (Array.isArray(data) && !hasFound) {
          data.forEach(item => {
            if (item.chartLayer === layer) {
              result = item
              hasFound = true
            } else if (item.children) {
              fn(item.children)
            }
          })
        }
      }
      fn(data)
      return result
    }
  }
}
</script>
