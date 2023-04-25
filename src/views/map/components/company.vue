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
      </div>
    </div>
    <div class="layout-flex-l chart-wrapper">
      <div v-if="chartType === 'sunburst'"
           class="chart-menu layered"
           :class="{'show': isMenuShow}">
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
import { getUuid } from '@/utils/uuid'

export default {
  name: 'Chart',
  data () {
    return {
      myChart: null,
      chartType: 'sunburst',
      dataUrl: 'static/data/data_3.json',
      data: {},
      dataCount: [],
      dataMenu: [],
      dataSelected: {},
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      isMenuShow: false,
      activeName: '旭日图',
      tabsList: [
        {
          label: '旭日图',
          name: 'sunburst'
        },
        {
          label: '树形图',
          name: 'tree'
        }
      ]
    }
  },
  watch: {
    activeName (val) {
      this.dataMenu = []
      this.chartType = this.tabsList.find(item => item.label === val).name
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

      // 加载数据
      const { data } = await axios.get(this.dataUrl)
      // 规范格式
      this.data = this.filterData(data)

      // 根据图形种类加载图形
      switch (this.chartType) {
        case 'sunburst':
          this.initSunburst()
          break
        case 'tree':
          this.initTree()
          break
      }
    },
    initSunburst () {
      this.myChart.clear()

      // 从已有数据中加载2层数据
      const filterLayer = this.filterLayerSunburst(this.data, 2)

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
      this.myChart.hideLoading()

      this.myChart.off('click')
      this.myChart.on('click', this.handleSunburstClick)
    },
    initTree () {
      this.myChart.clear()

      // 从已有数据中加载2层数据
      const filterLayer = this.filterLayerTree(this.data, 2)

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
          data: [filterLayer],
          roam: true,
          top: '1%',
          left: '7%',
          bottom: '1%',
          right: '20%',
          symbolSize: 7,
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

      this.myChart.setOption(option)
      this.myChart.hideLoading()

      this.myChart.off('click')
      this.myChart.on('click', this.handleTreeClick)
    },
    handleSunburstClick (params) {
      const { treePathInfo, data } = params
      const leafLength = treePathInfo[0].value
      const { layerIndex, isLeaf } = data
      const unitAngle = 360 / leafLength

      const startAngle = unitAngle * (layerIndex - 0.5)

      if (isLeaf) {
        this.dataMenu = []
        this.dataSelected = {}
        const newData = this.filterLayerSunburst(this.data, 2, data)
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
    handleTreeClick (params) {
      const currentData = this.myChart.getOption().series[0].data[0]
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
        this.myChart.setOption({
          series: {
            data: [newData]
          }
        })
      }
    },
    handleLayerItemClick (item) {
      if (item.children && item.children.length > 0) {
        this.dataSelected = item
      } else {
        this.dataSelected = {}
      }
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
              return this.filterLayerSunburst(item, layer)
            })
          }
        } else if (targetId === chartId) {
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
    onPopoverHide (item) {
      if (item.chartId === this.dataSelected.chartId) {
        this.dataSelected = {}
      }
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
    filterLayerSunburst (data = {}, layer, target = null) {
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
              return this.filterLayerSunburst(item, layer, target)
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
                  return this.filterLayerSunburst(item, 100)
                })
              }]
            }
          }
        }
        return result
      }
    },
    filterLayerTree (data = {}, layer) {
      if (!layer) {
        return data
      } else {
        const { children = [], chartLayer, ...other } = data
        const result = {
          ...other,
          collapsed: chartLayer >= layer,
          chartLayer,
          children: children && children.map((item) => {
            return this.filterLayerTree(item, layer)
          })
        }
        return result
      }
    }
  }
}
</script>
