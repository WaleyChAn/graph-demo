<template>
  <div class="layout-flex column">
    <div class="layout-flex-l chart-wrapper">
      <div class="chart-menu layered"
           :class="{'show': isMenuShow}">
        <!-- <div class="menu-line"></div> -->
        <div class="menu-content">
          <div v-for="item in dataMenu"
               :key="`p-${item.chartId}`"
               class="layered-content layout-flex column">
            <div class="layered-name layout-flex-s">{{ item.name }}</div>
            <div class="layered-list layout-flex-l">
              <div v-for="child in item.children"
                   :key="child.chartId"
                   class="layered-item"
                   :class="{'has-child': child.children && child.children.length > 0, 'active': child.chartId === dataSelected.chartId}"
                   @mouseenter="handleLayerItemClick(child)">
                <el-popover ref="popover"
                            :disabled="!(child.children && child.children.length > 0)"
                            popper-class="layered-popover"
                            placement="right"
                            trigger="hover"
                            @hide="onPopoverHide(child)">
                  <div class="chart-menu-tree">
                    <el-tree v-if="child.children && child.children.length > 0"
                             :data="[child]"
                             :props="defaultProps"
                             :indent="0"
                             default-expand-all></el-tree>
                  </div>
                  <div slot="reference">
                    <i v-if="child.children && child.children.length > 0"
                       class="el-icon-arrow-right"></i>
                    {{ child.name }}
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
          <!-- <template v-for="item in dataMenu">
            <div v-if="dataSelected.chartId"
                 :key="`c-${item.chartId}`"
                 class="layered-menu">
              <div class="layered-menu-wrapper">
                <div v-for="child in item.children"
                     :key="child.chartId"
                     class="layered-menu-item"
                     :class="{'show': child.chartId === dataSelected.chartId}">
                  <el-tree :data="[child]"
                           :props="defaultProps"
                           :indent="0"
                           default-expand-all></el-tree>
                </div>
              </div>
            </div>
          </template> -->

          <!-- <el-tree :data="dataMenu"
                   :props="defaultProps"
                   :indent="0"
                   default-expand-all></el-tree> -->
        </div>
      </div>
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
      dataUrl: 'static/data/data_3.json',
      data: {},
      dataPath: [],
      dataCount: [],
      dataMenu: [],
      dataSelected: {},
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      isMenuShow: false,
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
          nodeClick: false,
          center: ['50%', '50%'],
          radius: ['10%', '80%'],
          sort: undefined,
          itemStyle: {
            borderWidth: 2
          },
          label: {
            fontSize: 12
          },
          emphasis: {
            focus: 'ancestor'
          },
          levels: [
            {

            },
            {
              radius: ['10%', '40%'],
              label: {
                rotate: 'tangential'
              }
            },
            {
              radius: ['40%', '80%']
            }
          ]
        }
      }

      this.myChart.setOption(option)
      this.myChart.on('click', this.handleChartClick)
      this.myChart.hideLoading()
    },
    handleChartClick (params) {
      const { treePathInfo, data } = params
      const leafLength = treePathInfo[0].value
      const { layerIndex, isLeaf } = data
      const unitAngle = 360 / leafLength

      const startAngle = unitAngle * (layerIndex - 0.5)

      if (isLeaf) {
        this.dataMenu = []
        this.dataSelected = {}
        const newData = this.filterLayer(this.data, 2, data)
        this.isMenuShow = this.dataMenu.length > 0
        let opt = {}
        if (this.isMenuShow) {
          opt = {
            center: ['25%', '50%'],
            radius: ['0', '70%'],
            label: {
              fontSize: 10
            },
            levels: [
              {

              },
              {
                radius: ['5%', '25%'],
                label: {
                  rotate: 'tangential'
                }
              },
              {
                radius: ['25%', '60%']
              }
            ]
          }
        } else {
          opt = {
            center: ['50%', '50%'],
            radius: ['0', '80%'],
            label: {
              fontSize: 12
            },
            levels: [
              {

              },
              {
                radius: ['10%', '40%'],
                label: {
                  rotate: 'tangential'
                }
              },
              {
                radius: ['40%', '80%']
              }
            ]
          }
        }
        this.myChart.setOption({
          series: {
            ...opt,
            startAngle: startAngle,
            data: newData.children
          }
        })
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
    handleLayerItemClick (item) {
      if (item.children && item.children.length > 0) {
        this.dataSelected = item
      } else {
        this.dataSelected = {}
      }
    },
    onPopoverHide (item) {
      if (item.chartId === this.dataSelected.chartId) {
        this.dataSelected = {}
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
      this.dataCount[layer] = this.dataCount[layer] ? this.dataCount[layer] + 1 : 1
      let count = this.dataCount[layer]
      const result = {
        name: name.replace('<br>', '\n'),
        chartId: `chart-${getUuid()}`,
        chartLayer: layer,
        layerIndex: count,
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
    filterLayer (data = {}, layer, target = null) {
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
              return this.filterLayer(item, layer, target)
            })
          }
        } else {
          // result.value = children && children.length > 0 ? children.length : 1
          result.value = 1
          result.isLeaf = true
          if (result.procedureId) {
            result.label = {
              position: 'outside',
              padding: 3,
              silent: false
            }
          }
          if (target && target.chartId === result.chartId) {
            result.itemStyle = {
              color: '#004e9f'
            }
            if (children && children.length > 0) {
              this.dataMenu = [{
                ...result,
                children: children && children.map(item => {
                  return this.filterLayer(item, 100)
                })
              }]
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
    handleLeafSelected (data = {}, target = {}, layer) {
      if (!layer) {
        return data
      } else {
        const { children, chartId, chartLayer, ...other } = data
        const { chartId: targetId } = target
        const result = {
          ...other,
          chartLayer,
          chartId
        }
        if (chartLayer < layer) {
          if (children && children.length > 0) {
            result.children = children.map(item => {
              return this.filterLayer(item, layer)
            })
          }
        } else if (targetId === chartId) {
          // result.value = children && children.length > 0 ? children.length : 1
          result.value = 1
          result.isLeaf = true
        }
        if (targetId === chartId) {
          result.itemStyle = {
            color: '#004e9f'
          }
        } else if (chartLayer < layer) {
          result.children = children && children.map(item => {
            return this.handleLeafSelected(item, target)
          })
        }
        return result
      }
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
