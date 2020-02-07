> 地狱空荡荡，魔鬼在人间

> 保持独立思考，关键时刻能保命

# 新型冠状病毒**城市**趋势图

![](https://github.com/Norcy/nCov-City/blob/master/images/thumbnail.png)

由于一直很关注深圳市的疫情趋势，想知道它的确诊人数的变化趋势是如何的，有助于做决定或提前做好各种准备。

苦于找不到相关的工具/网站，所以 2 月 6 号下午心血来潮，自己动手造了个小轮子，可以方便快速查询城市疫情的发展趋势

[代码开源](https://github.com/norcy/nCov-City)，欢迎拍砖~

因为不是 H5 开发，代码写得很一般（前端技术更新迭代很快，我还停留在大学学的一点点基础），优先确保能工作即可

![IMG_4668.PNG]( http://ww1.sinaimg.cn/large/99e3e31egy1gbo9pu7tlrj207s07sdfo.jpg)

## 功能
1. 支持查询**城市级别**的历史数据
2. 支持两种模式：新增人数的发展趋势（柱状图）；累计人数的发展趋势（折线图）

    ![](https://github.com/Norcy/nCov-City/blob/master/images/screenshot1.png)

    ![](https://github.com/Norcy/nCov-City/blob/master/images/screenshot2.png)

3. 除了城市维度，也支持全国维度和省份维度

## 说明
1. 数据来源于丁香园
2. 接口使用的是 [https://lab.isaaclin.cn/nCoV/](https://lab.isaaclin.cn/nCoV/)，感谢无私奉献
3. 新增数据的计算方式与官方不同：`新增人数=今日人数-昨日人数`。因为我们只是需要简单查看趋势即可
4. 城市维度和省份维度官方只提供了`确诊人数`、`治愈人数`和`死亡人数`，全国维度除了这些还支持`疑似人数`和`重症人数`
5. 图表使用 EChart.js，很强大

## 优化
1. 支持 Cache，下次打开会记住你上一次选择的城市；但是数据会重新请求，防止过期
2. 新增人数模式下默认只展示`新增确诊`的柱状图，因为目前`治愈人数`和`死亡人数`没什么意义，防止干扰，当然也可以手动打开
3. 每次请求的是一个省的数据，在省内城市之间切换不会重新请求；同时数据也做了内存级别的 Cache，提升用户体验

## 交流
欢迎加入群聊，一起共享资讯、提提建议、反馈问题

![](https://github.com/Norcy/nCov-City/blob/master/images/group.png)
