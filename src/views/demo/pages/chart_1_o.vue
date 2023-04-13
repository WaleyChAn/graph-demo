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
      <div>
        <span v-for="(item, index) in dataPath"
              :key="item.constId"
              @click="setChartByTarget(item)">
          <i v-if="index > 0"
             class="el-icon-arrow-right"></i>
          {{ item.name }}
        </span>
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

export default {
  name: 'Chart',
  data () {
    return {
      myChart: null,
      dataUrl: 'static/data/data_1.json',
      data: {},
      dataPath: [],
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

      // const data = [
      //   {
      //     name: 'Flora',
      //     itemStyle: {
      //       color: '#da0d68'
      //     },
      //     children: [
      //       {
      //         name: 'Black Tea',
      //         value: 1,
      //         itemStyle: {
      //           color: '#975e6d'
      //         }
      //       },
      //       {
      //         name: 'Floral',
      //         itemStyle: {
      //           color: '#e0719c'
      //         },
      //         children: [
      //           {
      //             name: 'Chamomile',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f99e1c'
      //             }
      //           },
      //           {
      //             name: 'Rose',
      //             value: 1,
      //             itemStyle: {
      //               color: '#ef5a78'
      //             }
      //           },
      //           {
      //             name: 'Jasmine',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f7f1bd'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Fruity',
      //     itemStyle: {
      //       color: '#da1d23'
      //     },
      //     children: [
      //       {
      //         name: 'Berry',
      //         itemStyle: {
      //           color: '#dd4c51'
      //         },
      //         children: [
      //           {
      //             name: 'Blackberry',
      //             value: 1,
      //             itemStyle: {
      //               color: '#3e0317'
      //             }
      //           },
      //           {
      //             name: 'Raspberry',
      //             value: 1,
      //             itemStyle: {
      //               color: '#e62969'
      //             }
      //           },
      //           {
      //             name: 'Blueberry',
      //             value: 1,
      //             itemStyle: {
      //               color: '#6569b0'
      //             }
      //           },
      //           {
      //             name: 'Strawberry',
      //             value: 1,
      //             itemStyle: {
      //               color: '#ef2d36'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Dried Fruit',
      //         itemStyle: {
      //           color: '#c94a44'
      //         },
      //         children: [
      //           {
      //             name: 'Raisin',
      //             value: 1,
      //             itemStyle: {
      //               color: '#b53b54'
      //             }
      //           },
      //           {
      //             name: 'Prune',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a5446f'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Other Fruit',
      //         itemStyle: {
      //           color: '#dd4c51'
      //         },
      //         children: [
      //           {
      //             name: 'Coconut',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f2684b'
      //             }
      //           },
      //           {
      //             name: 'Cherry',
      //             value: 1,
      //             itemStyle: {
      //               color: '#e73451'
      //             }
      //           },
      //           {
      //             name: 'Pomegranate',
      //             value: 1,
      //             itemStyle: {
      //               color: '#e65656'
      //             }
      //           },
      //           {
      //             name: 'Pineapple',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f89a1c'
      //             }
      //           },
      //           {
      //             name: 'Grape',
      //             value: 1,
      //             itemStyle: {
      //               color: '#aeb92c'
      //             }
      //           },
      //           {
      //             name: 'Apple',
      //             value: 1,
      //             itemStyle: {
      //               color: '#4eb849'
      //             }
      //           },
      //           {
      //             name: 'Peach',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f68a5c'
      //             }
      //           },
      //           {
      //             name: 'Pear',
      //             value: 1,
      //             itemStyle: {
      //               color: '#baa635'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Citrus Fruit',
      //         itemStyle: {
      //           color: '#f7a128'
      //         },
      //         children: [
      //           {
      //             name: 'Grapefruit',
      //             value: 1,
      //             itemStyle: {
      //               color: '#f26355'
      //             }
      //           },
      //           {
      //             name: 'Orange',
      //             value: 1,
      //             itemStyle: {
      //               color: '#e2631e'
      //             }
      //           },
      //           {
      //             name: 'Lemon',
      //             value: 1,
      //             itemStyle: {
      //               color: '#fde404'
      //             }
      //           },
      //           {
      //             name: 'Lime',
      //             value: 1,
      //             itemStyle: {
      //               color: '#7eb138'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Sour/\nFermented',
      //     itemStyle: {
      //       color: '#ebb40f'
      //     },
      //     children: [
      //       {
      //         name: 'Sour',
      //         itemStyle: {
      //           color: '#e1c315'
      //         },
      //         children: [
      //           {
      //             name: 'Sour Aromatics',
      //             value: 1,
      //             itemStyle: {
      //               color: '#9ea718'
      //             }
      //           },
      //           {
      //             name: 'Acetic Acid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#94a76f'
      //             }
      //           },
      //           {
      //             name: 'Butyric Acid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#d0b24f'
      //             }
      //           },
      //           {
      //             name: 'Isovaleric Acid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#8eb646'
      //             }
      //           },
      //           {
      //             name: 'Citric Acid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#faef07'
      //             }
      //           },
      //           {
      //             name: 'Malic Acid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#c1ba07'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Alcohol/\nFremented',
      //         itemStyle: {
      //           color: '#b09733'
      //         },
      //         children: [
      //           {
      //             name: 'Winey',
      //             value: 1,
      //             itemStyle: {
      //               color: '#8f1c53'
      //             }
      //           },
      //           {
      //             name: 'Whiskey',
      //             value: 1,
      //             itemStyle: {
      //               color: '#b34039'
      //             }
      //           },
      //           {
      //             name: 'Fremented',
      //             value: 1,
      //             itemStyle: {
      //               color: '#ba9232'
      //             }
      //           },
      //           {
      //             name: 'Overripe',
      //             value: 1,
      //             itemStyle: {
      //               color: '#8b6439'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Green/\nVegetative',
      //     itemStyle: {
      //       color: '#187a2f'
      //     },
      //     children: [
      //       {
      //         name: 'Olive Oil',
      //         value: 1,
      //         itemStyle: {
      //           color: '#a2b029'
      //         }
      //       },
      //       {
      //         name: 'Raw',
      //         value: 1,
      //         itemStyle: {
      //           color: '#718933'
      //         }
      //       },
      //       {
      //         name: 'Green/\nVegetative',
      //         itemStyle: {
      //           color: '#3aa255'
      //         },
      //         children: [
      //           {
      //             name: 'Under-ripe',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a2bb2b'
      //             }
      //           },
      //           {
      //             name: 'Peapod',
      //             value: 1,
      //             itemStyle: {
      //               color: '#62aa3c'
      //             }
      //           },
      //           {
      //             name: 'Fresh',
      //             value: 1,
      //             itemStyle: {
      //               color: '#03a653'
      //             }
      //           },
      //           {
      //             name: 'Dark Green',
      //             value: 1,
      //             itemStyle: {
      //               color: '#038549'
      //             }
      //           },
      //           {
      //             name: 'Vegetative',
      //             value: 1,
      //             itemStyle: {
      //               color: '#28b44b'
      //             }
      //           },
      //           {
      //             name: 'Hay-like',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a3a830'
      //             }
      //           },
      //           {
      //             name: 'Herb-like',
      //             value: 1,
      //             itemStyle: {
      //               color: '#7ac141'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Beany',
      //         value: 1,
      //         itemStyle: {
      //           color: '#5e9a80'
      //         }
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Other',
      //     itemStyle: {
      //       color: '#0aa3b5'
      //     },
      //     children: [
      //       {
      //         name: 'Papery/Musty',
      //         itemStyle: {
      //           color: '#9db2b7'
      //         },
      //         children: [
      //           {
      //             name: 'Stale',
      //             value: 1,
      //             itemStyle: {
      //               color: '#8b8c90'
      //             }
      //           },
      //           {
      //             name: 'Cardboard',
      //             value: 1,
      //             itemStyle: {
      //               color: '#beb276'
      //             }
      //           },
      //           {
      //             name: 'Papery',
      //             value: 1,
      //             itemStyle: {
      //               color: '#fefef4'
      //             }
      //           },
      //           {
      //             name: 'Woody',
      //             value: 1,
      //             itemStyle: {
      //               color: '#744e03'
      //             }
      //           },
      //           {
      //             name: 'Moldy/Damp',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a3a36f'
      //             }
      //           },
      //           {
      //             name: 'Musty/Dusty',
      //             value: 1,
      //             itemStyle: {
      //               color: '#c9b583'
      //             }
      //           },
      //           {
      //             name: 'Musty/Earthy',
      //             value: 1,
      //             itemStyle: {
      //               color: '#978847'
      //             }
      //           },
      //           {
      //             name: 'Animalic',
      //             value: 1,
      //             itemStyle: {
      //               color: '#9d977f'
      //             }
      //           },
      //           {
      //             name: 'Meaty Brothy',
      //             value: 1,
      //             itemStyle: {
      //               color: '#cc7b6a'
      //             }
      //           },
      //           {
      //             name: 'Phenolic',
      //             value: 1,
      //             itemStyle: {
      //               color: '#db646a'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Chemical',
      //         itemStyle: {
      //           color: '#76c0cb'
      //         },
      //         children: [
      //           {
      //             name: 'Bitter',
      //             value: 1,
      //             itemStyle: {
      //               color: '#80a89d'
      //             }
      //           },
      //           {
      //             name: 'Salty',
      //             value: 1,
      //             itemStyle: {
      //               color: '#def2fd'
      //             }
      //           },
      //           {
      //             name: 'Medicinal',
      //             value: 1,
      //             itemStyle: {
      //               color: '#7a9bae'
      //             }
      //           },
      //           {
      //             name: 'Petroleum',
      //             value: 1,
      //             itemStyle: {
      //               color: '#039fb8'
      //             }
      //           },
      //           {
      //             name: 'Skunky',
      //             value: 1,
      //             itemStyle: {
      //               color: '#5e777b'
      //             }
      //           },
      //           {
      //             name: 'Rubber',
      //             value: 1,
      //             itemStyle: {
      //               color: '#120c0c'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Roasted',
      //     itemStyle: {
      //       color: '#c94930'
      //     },
      //     children: [
      //       {
      //         name: 'Pipe Tobacco',
      //         value: 1,
      //         itemStyle: {
      //           color: '#caa465'
      //         }
      //       },
      //       {
      //         name: 'Tobacco',
      //         value: 1,
      //         itemStyle: {
      //           color: '#dfbd7e'
      //         }
      //       },
      //       {
      //         name: 'Burnt',
      //         itemStyle: {
      //           color: '#be8663'
      //         },
      //         children: [
      //           {
      //             name: 'Acrid',
      //             value: 1,
      //             itemStyle: {
      //               color: '#b9a449'
      //             }
      //           },
      //           {
      //             name: 'Ashy',
      //             value: 1,
      //             itemStyle: {
      //               color: '#899893'
      //             }
      //           },
      //           {
      //             name: 'Smoky',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a1743b'
      //             }
      //           },
      //           {
      //             name: 'Brown, Roast',
      //             value: 1,
      //             itemStyle: {
      //               color: '#894810'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Cereal',
      //         itemStyle: {
      //           color: '#ddaf61'
      //         },
      //         children: [
      //           {
      //             name: 'Grain',
      //             value: 1,
      //             itemStyle: {
      //               color: '#b7906f'
      //             }
      //           },
      //           {
      //             name: 'Malt',
      //             value: 1,
      //             itemStyle: {
      //               color: '#eb9d5f'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Spices',
      //     itemStyle: {
      //       color: '#ad213e'
      //     },
      //     children: [
      //       {
      //         name: 'Pungent',
      //         value: 1,
      //         itemStyle: {
      //           color: '#794752'
      //         }
      //       },
      //       {
      //         name: 'Pepper',
      //         value: 1,
      //         itemStyle: {
      //           color: '#cc3d41'
      //         }
      //       },
      //       {
      //         name: 'Brown Spice',
      //         itemStyle: {
      //           color: '#b14d57'
      //         },
      //         children: [
      //           {
      //             name: 'Anise',
      //             value: 1,
      //             itemStyle: {
      //               color: '#c78936'
      //             }
      //           },
      //           {
      //             name: 'Nutmeg',
      //             value: 1,
      //             itemStyle: {
      //               color: '#8c292c'
      //             }
      //           },
      //           {
      //             name: 'Cinnamon',
      //             value: 1,
      //             itemStyle: {
      //               color: '#e5762e'
      //             }
      //           },
      //           {
      //             name: 'Clove',
      //             value: 1,
      //             itemStyle: {
      //               color: '#a16c5a'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Nutty/\nCocoa',
      //     itemStyle: {
      //       color: '#a87b64'
      //     },
      //     children: [
      //       {
      //         name: 'Nutty',
      //         itemStyle: {
      //           color: '#c78869'
      //         },
      //         children: [
      //           {
      //             name: 'Peanuts',
      //             value: 1,
      //             itemStyle: {
      //               color: '#d4ad12'
      //             }
      //           },
      //           {
      //             name: 'Hazelnut',
      //             value: 1,
      //             itemStyle: {
      //               color: '#9d5433'
      //             }
      //           },
      //           {
      //             name: 'Almond',
      //             value: 1,
      //             itemStyle: {
      //               color: '#c89f83'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Cocoa',
      //         itemStyle: {
      //           color: '#bb764c'
      //         },
      //         children: [
      //           {
      //             name: 'Chocolate',
      //             value: 1,
      //             itemStyle: {
      //               color: '#692a19'
      //             }
      //           },
      //           {
      //             name: 'Dark Chocolate',
      //             value: 1,
      //             itemStyle: {
      //               color: '#470604'
      //             }
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Sweet',
      //     itemStyle: {
      //       color: '#e65832'
      //     },
      //     children: [
      //       {
      //         name: 'Brown Sugar',
      //         itemStyle: {
      //           color: '#d45a59'
      //         },
      //         children: [
      //           {
      //             name: 'Molasses',
      //             value: 1,
      //             itemStyle: {
      //               color: '#310d0f'
      //             }
      //           },
      //           {
      //             name: 'Maple Syrup',
      //             value: 1,
      //             itemStyle: {
      //               color: '#ae341f'
      //             }
      //           },
      //           {
      //             name: 'Caramelized',
      //             value: 1,
      //             itemStyle: {
      //               color: '#d78823'
      //             }
      //           },
      //           {
      //             name: 'Honey',
      //             value: 1,
      //             itemStyle: {
      //               color: '#da5c1f'
      //             }
      //           }
      //         ]
      //       },
      //       {
      //         name: 'Vanilla',
      //         value: 1,
      //         itemStyle: {
      //           color: '#f89a80'
      //         }
      //       },
      //       {
      //         name: 'Vanillin',
      //         value: 1,
      //         itemStyle: {
      //           color: '#f37674'
      //         }
      //       },
      //       {
      //         name: 'Overall Sweet',
      //         value: 1,
      //         itemStyle: {
      //           color: '#e75b68'
      //         }
      //       },
      //       {
      //         name: 'Sweet Aromatics',
      //         value: 1,
      //         itemStyle: {
      //           color: '#d0545f'
      //         }
      //       }
      //     ]
      //   }
      // ]
      const { data } = await axios.get(this.dataUrl)
      const { name } = data
      this.data = data
      this.dataPath.push({
        name
      })
      const option = {
        series: {
          type: 'sunburst',
          data: this.filterData(data.children),
          radius: ['10%', '80%'],
          sort: undefined,
          itemStyle: {
            borderRadius: 7,
            borderWidth: 2
          },
          emphasis: {
            focus: 'ancestor'
          }
        }
      }

      this.myChart.setOption(option)
      this.myChart.on('click', (params) => {
        const { data } = params
        this.setChartByTarget(data)
      })
    },
    setChartByTarget (data) {
      const { name, layerId } = data
      let target = this.getChidlren(this.data.children, layerId)
      const targetIndex = this.dataPath.findIndex(item => item.id === layerId)
      if (targetIndex < 0) {
        this.dataPath.push({
          name, layerId
        })
      } else if (targetIndex === 0) {
        target = this.data
      } else {
        this.dataPath = this.dataPath.slice(0, targetIndex + 1)
      }
      if (target && target.children && target.children.length > 0) {
        this.myChart.setOption({
          series: {
            data: this.filterData(target.children)
          }
        })
      }
    },
    filterData (data, layer = 0) {
      const result = []
      data.forEach(item => {
        let { name, children, procedureId } = item
        name = name.replace('<br>', '\n')
        const obj = {
          name: name,
          layer,
          layerId: layer,
          label: {
            overflow: 'truncate'
          }
        }
        if (layer > 0) {
          obj.value = children && children.length > 0 ? children.length : 1
          obj.label = {
            position: 'outside',
            padding: 3,
            silent: false
          }
        } else {
          if (children && children.length > 0) {
            obj.children = this.filterData(children, layer + 1)
          } else {
            obj.value = 1
            if (procedureId) {
              obj.label = {
                position: 'outside',
                padding: 3,
                silent: false
              }
            }
          }
        }
        result.push(obj)
      })
      return result
    },
    getChidlren (data, id) {
      var hasFound = false
      var result = null
      var fn = function (data) {
        if (Array.isArray(data) && !hasFound) {
          data.forEach(item => {
            console.log(item.layerId, id)
            if (item.layerId === id) {
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
    },
    handleClick (tab, event) {
      console.log(tab, event)
    }
  }
}
</script>
