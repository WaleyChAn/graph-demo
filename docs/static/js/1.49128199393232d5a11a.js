webpackJsonp([1],{v6mk:function(t,a,e){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var n={render:function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"demo layout-flex column pa-xs"},[e("div",{staticClass:"layout-flex-s"},[e("el-tabs",{attrs:{type:"card"},on:{"tab-click":t.handleClick},model:{value:t.activePath,callback:function(a){t.activePath=a},expression:"activePath"}},t._l(t.tabsList,function(t){return e("el-tab-pane",{key:t.name,attrs:{label:t.label,name:t.path}})}),1)],1),t._v(" "),e("div",{staticClass:"layout-flex-l"},[e("router-view")],1)])},staticRenderFns:[]},l=e("VU/8")({name:"Demo",data:function(){return{activePath:"/map/company",tabsList:[{label:"公司地图",name:"company",path:"/map/company"},{label:"部门地图",name:"dept",path:"/map/dept"},{label:"项目地图",name:"project",path:"/map/project"}]}},mounted:function(){this.activePath=this.$route.path},methods:{handleClick:function(t,a){var e=this,n=this.tabsList.find(function(t){return t.path===e.activePath}).path;this.$router.push(n)}}},n,!1,null,null,null);a.default=l.exports}});
//# sourceMappingURL=1.49128199393232d5a11a.js.map