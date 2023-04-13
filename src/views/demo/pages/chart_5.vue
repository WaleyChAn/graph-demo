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
    <div class="layout-flex-l"
         ref="myPage">
      <RelationGraph ref="seeksRelationGraph"
                     :options="graphOptions">
        <div slot="node"
             slot-scope="{node}"
             class="relation-node"
             :class="{'last-child': node.lot.childs_size === 0, 'procedure': node.data.procedureId }"
             @mouseover="showNodeTips(node, $event)"
             @mouseout="hideNodeTips(node, $event)">
          <span v-html="node.text"></span>
        </div>
      </RelationGraph>
    </div>
    <div v-if="isShowNodeTipsPanel"
         :style="{left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
         class="relation-node-popup">
      <div v-for="(item, index) in getCurrentNodeParents(this.currentNode)"
           :key="item.id"
           class="c-node-menu-item">
        <i v-if="index > 0"
           class="c-node-menu-sign el-icon-arrow-down"></i>
        <span v-html="item.text"></span>
      </div>
    </div>
  </div>
</template>

<script>
import RelationGraph from 'relation-graph'
import axios from 'axios'
// import { v4 as uuidv4 } from 'uuid'
import { getUuid } from '@/utils/uuid'

export default {
  name: 'Chart',
  components: {
    RelationGraph
  },
  data () {
    return {
      dataUrl: 'static/data/data_1.json',
      dataLv: 0,
      data: {},
      currentNode: {},
      currentNodeParents: [],
      isShowNodeTipsPanel: false,
      nodeMenuPanelPosition: { x: 0, y: 0 },
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
      graphOptions: {
        debug: true,
        'layouts': [
          {
            'label': '中心',
            'layoutName': 'tree',
            'layoutClassName': 'seeks-layout-center',
            'defaultJunctionPoint': 'border',
            'defaultNodeShape': 0,
            'defaultLineShape': 1,
            // 'from': 'left',
            // 通过这4个属性来调整 tree-层级距离&节点距离
            'min_per_width': '80',
            'max_per_width': '100',
            'min_per_height': '200',
            'max_per_height': '500'
          }
        ],
        'defaultExpandHolderPosition': 'bottom',
        'defaultNodeShape': 1,
        // 'defaultNodeWidth': '100',
        'defaultLineShape': 4,
        'defaultJunctionPoint': 'lr',
        'defaultNodeBorderWidth': 0,
        // 'defaultLineColor': 'rgba(0, 186, 189, 1)',
        'defaultNodeColor': '#ddd'
      }
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
      const { data } = await axios.get(this.dataUrl)
      this.data = this.filterData(data)

      this.g_loading = false
      this.$refs.seeksRelationGraph.setJsonData({
        rootId: this.data.id,
        nodes: [this.data],
        lines: []
      }, (graphInstance) => {
      })
    },
    filterData (data = {}, layer = 0) {
      const { name = '', children = [], procedureId } = data

      const result = {
        text: name,
        id: `chart-${getUuid()}`,
        styleClass: 'chart-node',
        data: {
          chartLayer: layer,
          procedureId
        },
        children: children && children.map(item => {
          return this.filterData(item, layer + 1)
        })
      }
      return result
    },
    getCurrentNodeParents (node, parents = []) {
      const { lot } = node
      parents.unshift(node)
      if (lot.parent) {
        return this.getCurrentNodeParents(lot.parent, parents)
      } else {
        return parents
      }
    },
    showNodeTips (nodeObject, $event) {
      this.currentNode = nodeObject
      const basePosition = this.$refs.myPage.getBoundingClientRect()
      this.isShowNodeTipsPanel = true
      this.nodeMenuPanelPosition.x = $event.clientX - basePosition.x + 20
      this.nodeMenuPanelPosition.y = $event.clientY - basePosition.y + 20
    },
    hideNodeTips (nodeObject, $event) {
      this.isShowNodeTipsPanel = false
    }
  }
}
</script>

<style lang="scss" scoped>
.relation-node {
  padding: 8px;
  min-width: 100px;
  border-radius: 5px;
  background: #88c86a;
  cursor: pointer;
}
.relation-node.procedure {
  background: #f9be39;
}
.relation-node.procedure.last-child {
  height: 200px;
  min-width: 0;
  writing-mode: vertical-lr;
  text-align: left;
  background: #667fcc;
}
.relation-node-popup {
  position: absolute;
  z-index: 999;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  .c-node-menu-item {
    font-size: 12px;
    color: #606266;
    text-align: center;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
    i {
      display: block;
      padding: 2px 0;
      opacity: 0.5;
    }
    span {
      padding: 2px 0;
      display: block;
    }
  }
}
</style>
