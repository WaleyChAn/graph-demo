<template>
  <div class="layout-flex column">
    <div class="layout-flex-s pb-xs">
      <div class="layout-flex">
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
        <div class="layout-flex-s">
          <div class="layout-flex align-center ml-sm"
               style="opacity: .5;">
            是否开启筛选
          </div>
        </div>
        <div class="layout-flex-s">
          <div class="layout-flex align-center ml-xs">
            <el-switch v-model="switchValue"
                       @change="handleSwitch">
            </el-switch>
          </div>
        </div>
        <div v-if="switchValue"
             class="layout-flex-l">
          <div class="layout-flex align-center ml-xs">
            <el-autocomplete class="inline-input"
                             v-model="filterValue"
                             :fetch-suggestions="querySearch"
                             size="small"
                             value-key="name"
                             prefix-icon="el-icon-search"
                             style="width: 300px;"
                             placeholder="请输入内容"
                             :trigger-on-focus="false"
                             @select="handleSelect"
                             clearable></el-autocomplete>
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
      switchValue: false,
      filterValue: '',
      restaurants: [],
      dataUrl: 'static/data/data_1.json',
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
      this.myChart = echarts.init(chartDom)
      this.myChart.showLoading()
      const formatUtil = echarts.format

      const res = await axios.get(this.dataUrl)
      const data = res.data
      this.data = this.filterData(data)
      this.restaurants = this.treeToArray(this.data.children)
      // if (res) {
      //   data.push(res.data || [])
      // }
      const option = {
        tooltip: {
          formatter: function (info) {
            // var value = info.value
            var treePathInfo = info.treePathInfo
            var treePath = []
            for (var i = 1; i < treePathInfo.length; i++) {
              treePath.push(treePathInfo[i].name)
            }
            return [
              '<div class="tooltip-title">' +
              formatUtil.encodeHTML(treePath.join('/')) +
              '</div>'
              // 'Disk Usage: ' + formatUtil.addCommas(value) + ' KB'
            ].join('')
          }
        },
        series: {
          type: 'treemap',
          data: this.data.children,
          visibleMin: 300,
          leafDepth: 3,
          label: {
            show: true,
            formatter: '{b}'
          },
          upperLabel: {
            show: true,
            height: 30,
            padding: 5
          },
          itemStyle: {
            borderColor: '#fff'
          },
          levels: this.getLevelOption()
        }
      }

      this.myChart.setOption(option)
      // this.myChart.on('click', (p) => {
      //   console.log(p.getId())
      // })
      this.myChart.hideLoading()
    },
    getLevelOption () {
      return [
        {
          itemStyle: {
            colorSaturation: [0.6, 0.7],
            borderWidth: 0,
            gapWidth: 5
          }
        },
        {
          colorSaturation: [0.5, 0.6],
          itemStyle: {
            gapWidth: 1
          }
        },
        {
          colorSaturation: [0.4, 0.5],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        },
        {
          colorSaturation: [0.3, 0.4],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        },
        {
          colorSaturation: [0.2, 0.3],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        },
        {
          colorSaturation: [0.1, 0.2],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        },
        {
          colorSaturation: [0, 0.1],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        }
      ]
    },
    filterData (data = {}, layer = 0) {
      const { name = '', children = [], procedureId } = data

      const result = {
        name: name.replace('<br>', '\n'),
        chartId: `chart-${getUuid()}`,
        chartLayer: layer,
        procedureId,
        value: children && children.length > 0 ? children.length : 1,
        children: children && children.map(item => {
          return this.filterData(item, layer + 1)
        })
      }
      // if (children && children.length === 0 && procedureId) {
      //   result.value = 1
      // }
      return result
    },
    filterTarget (data = {}, id) {
      const { children = [], chartId } = data
      let result = null
      // children && children.forEach(item => {
      //   if (item.chartId === id) {
      //     result = {
      //       ...data
      //     }
      //   } else {
      //     const target = this.filterTarget(item, id)
      //     if (target) {
      //       result = target
      //     }
      //   }
      // })
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
    treeToArray (tree) {
      let res = []
      for (const item of tree) {
        const { children, ...i } = item
        if (children && children.length) {
          res = res.concat(this.treeToArray(children))
        }
        res.push(i)
      }
      return res
    },
    querySearch (queryString, cb) {
      var restaurants = this.restaurants
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
      }
    },
    handleSwitch (val) {
      const leafDepth = val ? null : 3
      this.myChart.setOption({
        series: {
          leafDepth
        }
      })
    },
    handleSelect (item) {
      if (item) {
        const target = this.filterTarget(this.data, item.chartId)
        if (target) {
          this.myChart.dispatchAction({
            type: 'treemapZoomToNode',
            targetNode: target.name
          })
        }
      }
    }
  }
}
</script>
