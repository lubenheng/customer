import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import DownloadList from './DownloadList.vue'
import FeaturesTitle from './FeaturesTitle.vue'
import './custom.css'

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  自定义主题入口：继承默认主题，叠加企业风格样式，注册全局组件
// 参数说明  无
// 返回参数  主题对象
// 使用示例  VitePress 自动加载 .vitepress/theme/index.mjs；页面中写 <DownloadList dir="code" />
// 备注信息  样式在 custom.css；下载列表数据来自 downloads.data.mjs（扫描 public/downloads）；
//           首页卡片区标题通过 home-features-before 插槽插入
//-------------------------------------------------------------------------------------------------------------------
export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-before': () => h(FeaturesTitle)
    })
  },
  enhanceApp({ app }) {
    app.component('DownloadList', DownloadList)
  }
}
