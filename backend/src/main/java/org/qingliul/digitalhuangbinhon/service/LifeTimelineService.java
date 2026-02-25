package org.qingliul.digitalhuangbinhon.service;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.qingliul.digitalhuangbinhon.entity.TimelineEvent;

import java.util.List;
import java.util.Map;

public interface LifeTimelineService {

    // 获取生平事件列表
    Map<String, Object> getLifeTimelineList(Integer year, Integer page, Integer size);

    // 获取生平事件详情
    Map<String, Object> getLifeTimelineDetail(Integer timelineId);
    List<Map<String, Object>> selectYearArtStats();

}