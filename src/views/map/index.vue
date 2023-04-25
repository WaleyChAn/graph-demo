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
      activePath: '/map/company',
      tabsList: [
        {
          label: '公司地图',
          name: 'company',
          path: '/map/company'
        },
        {
          label: '部门地图',
          name: 'dept',
          path: '/map/dept'
        },
        {
          label: '项目地图',
          name: 'project',
          path: '/map/project'
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
