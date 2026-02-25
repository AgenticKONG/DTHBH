package org.qingliul.digitalhuangbinhon.service.impl;

import org.qingliul.digitalhuangbinhon.entity.LifeTimeline;
import org.qingliul.digitalhuangbinhon.mapper.LifeTimelineMapper;
import org.qingliul.digitalhuangbinhon.mapper.WorksMapper;
import org.qingliul.digitalhuangbinhon.service.LifeTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LifeTimelineServiceImpl implements LifeTimelineService {

    @Autowired
    private LifeTimelineMapper lifeTimelineMapper;

    @Autowired
    private WorksMapper worksMapper;

    @Override
    public Map<String, Object> getLifeTimelineList(Integer year, Integer page, Integer size) {
        // 设置默认值
        page = (page == null || page < 1) ? 1 : page;
        size = (size == null || size < 1) ? 10 : size;
        int start = (page - 1) * size;

        // 构建查询参数
        Map<String, Object> params = new HashMap<>();
        params.put("year", year);
        params.put("start", start);
        params.put("size", size);

        // 查询数据
        List<LifeTimeline> timelineList = lifeTimelineMapper.selectLifeTimelineList(params);
        Integer total = lifeTimelineMapper.countLifeTimelineList(params);

        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("list", timelineList);
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    @Override
    public List<Map<String, Object>> selectYearArtStats() {
        return lifeTimelineMapper.selectYearArtStats();
    }
    @Override
    public Map<String, Object> getLifeTimelineDetail(Integer timelineId) {
        // 查询生平事件基本信息
        LifeTimeline timeline = lifeTimelineMapper.selectLifeTimelineById(timelineId);
        if (timeline == null) {
            return null;
        }

        // 查询关联的作品ID列表
        List<Integer> worksIds = lifeTimelineMapper.selectWorksIdsByTimelineId(timelineId);

        // 查询作品简要信息
        List<Map<String, Object>> relatedWorks = new ArrayList<>();
        for (Integer worksId : worksIds) {
            // 这里需要先实现一个查询作品简要信息的方法
            // 暂时先简单处理，后面可以优化
            Map<String, Object> workInfo = new HashMap<>();
            workInfo.put("worksId", worksId);
            // 可以从worksMapper中查询更多信息
            relatedWorks.add(workInfo);
        }

        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("timelineId", timeline.getTimelineId());
        result.put("year", timeline.getYear());
        result.put("month", timeline.getMonth());
        result.put("day", timeline.getDay());
        result.put("eventTitle", timeline.getEventTitle());
        result.put("eventDetail", timeline.getEventDetail());
        result.put("relatedWorks", relatedWorks);

        return result;
    }
}