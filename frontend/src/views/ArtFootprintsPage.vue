<template>
  <div class="art-footprints">
    <div class="hbh-breadcrumb">
      <a href="/">首页</a> &gt;
      <span>艺术足迹</span>
    </div>

    <!-- 足迹地图 -->
    <div class="map-container">
      <!-- 地图内容将通过JavaScript渲染 -->
      <div id="footprint-map"></div>
    </div>

    <!-- 时间线 -->
    <div class="timeline">
      <div class="timeline-item" v-for="(item, index) in timelineData" :key="index">
        <div class="timeline-year">{{ item.year }}</div>
        <div class="timeline-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <div class="timeline-location"><i class="fas fa-map-marker-alt"></i> {{ item.location }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArtFootprints',
  data() {
    return {
      timelineData: [
        {
          year: '1865年',
          title: '出生于浙江金华',
          description: '黄宾虹出生于浙江金华，初名懋质，后改名质，字朴存，号宾虹。',
          location: '浙江金华'
        },
        {
          year: '1887年',
          title: '赴扬州',
          description: '赴扬州，从郑珊学山水，从陈崇光学花鸟。',
          location: '江苏扬州'
        },
        {
          year: '1907年',
          title: '移居上海',
          description: '移居上海，开始参与新文化运动，编辑美术书刊。',
          location: '上海'
        },
        {
          year: '1937年',
          title: '赴北平',
          description: '应北平艺专之聘，赴北平任教。',
          location: '北京'
        },
        {
          year: '1948年',
          title: '任教杭州艺专',
          description: '应杭州国立艺术专科学校之聘，任教授。',
          location: '浙江杭州'
        },
        {
          year: '1955年',
          title: '逝世',
          description: '3月25日，黄宾虹在杭州逝世，享年92岁。',
          location: '浙江杭州'
        }
      ]
    };
  },
  mounted() {
    // 这里可以初始化地图API
    console.log('初始化艺术足迹地图');
  }
};
</script>

<style scoped>
  .art-footprints {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    padding-top: 100px;
  }

  .map-container {
    height: 500px;
    background-color: #f5f0e6;
    border-radius: 10px;
    margin-bottom: 40px;
    overflow: hidden;
    position: relative;
  }

  #footprint-map {
    width: 100%;
    height: 100%;
  }

  .timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
  }

  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50px;
    height: 100%;
    width: 2px;
    background-color: #d2b48c;
  }

  .timeline-item {
    display: flex;
    margin-bottom: 40px;
    position: relative;
  }

  .timeline-year {
    width: 100px;
    font-size: 18px;
    font-weight: bold;
    color: #8b4513;
    text-align: right;
    padding-right: 20px;
  }

  .timeline-content {
    flex: 1;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .timeline-content h3 {
    margin-bottom: 10px;
    color: #333;
  }

  .timeline-content p {
    margin-bottom: 10px;
    color: #666;
  }

  .timeline-location {
    color: #8b4513;
    font-size: 14px;
  }

  .timeline-item::before {
    content: '';
    position: absolute;
    left: 44px;
    top: 5px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #8b4513;
  }
</style>
