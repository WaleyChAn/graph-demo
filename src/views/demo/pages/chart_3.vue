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

export default {
  name: 'Chart',
  data () {
    return {
      dataUrl: 'static/data/data_1.json',
      dataLv: 0,
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
      const data = []
      if (res) {
        data.push(res.data || [])
      }
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
          data: this.filterData(data),
          roam: true,
          top: '1%',
          left: '7%',
          bottom: '1%',
          right: '20%',
          symbolSize: 7,
          initialTreeDepth: 2,
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9
          },
          // lineStyle: {
          //   width: 1
          // },
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
    },
    filterData (data) {
      const result = []
      this.dataLv++
      data.forEach(item => {
        let { name, children } = item
        name = name.replace('<br>', '\n')
        const obj = {
          name: name
        }
        if (children && children.length > 0) {
          obj.children = this.filterData(children)
          // obj.value = children.length
        } else {
          obj.value = 1
        }
        result.push(obj)
      })
      return result
    },
    handleClick (tab, event) {
      console.log(tab, event)
    }
  }
}
</script>
