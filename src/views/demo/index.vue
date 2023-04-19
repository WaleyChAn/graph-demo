<template>
  <div class="demo layout-flex column pa-xs">
    <div class="layout-flex-s">
      <el-tabs v-model="activePath"
               type="card"
               @tab-click="handleClick">
        <el-tab-pane v-for="item in tabsList"
                     :key="item.name"
                     :label="item.label"
                     :name="item.path">
          <!-- <div slot="label">
            <el-badge :hidden="!item.badge"
                      :value="item.badge">{{item.label}}</el-badge>
          </div> -->
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="layout-flex-l">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Demo',
  data () {
    return {
      activePath: '/chart_1',
      tabsList: [
        {
          label: '旭日图',
          name: 'chart_1',
          path: '/chart_1'
        },
        {
          label: '旭日图（新）',
          name: 'chart_1_n',
          path: '/chart_1_n'
        },
        {
          label: '矩形树图',
          name: 'chart_2',
          path: '/chart_2'
        },
        {
          label: '从左到右树状图（新）',
          name: 'chart_3',
          path: '/chart_3',
          badge: 'update'
        },
        {
          label: '径向树状图',
          name: 'chart_4',
          path: '/chart_4'
        },
        {
          label: '可缩放树图',
          name: 'chart_5',
          path: '/chart_5'
        },
        {
          label: '列向矩形树图',
          name: 'chart_6',
          path: '/chart_6',
          badge: 'new'
        },
        {
          label: '扇型进入旭日图',
          name: 'chart_7',
          path: '/chart_7',
          badge: 'new'
        }
      ]
    }
  },
  mounted () {
    this.activePath = this.$route.path
  },
  methods: {
    handleClick (tab, event) {
      const path = this.tabsList.find(item => item.path === this.activePath).path
      this.$router.push(path)
    }
  }
}
</script>
