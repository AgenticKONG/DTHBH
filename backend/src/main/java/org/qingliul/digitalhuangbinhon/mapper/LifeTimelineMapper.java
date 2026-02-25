package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.qingliul.digitalhuangbinhon.entity.LifeTimeline;
import org.qingliul.digitalhuangbinhon.entity.vo.LifeTimelineVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface LifeTimelineMapper {

    // 查询生平事件列表（支持分页和年份筛选）
    List<LifeTimeline> selectLifeTimelineList(Map<String, Object> params);

    // 查询生平事件总数
    Integer countLifeTimelineList(Map<String, Object> params);

    // 根据ID查询生平事件详情
    LifeTimeline selectLifeTimelineById(Integer timelineId);

    // 查询生平事件关联的作品ID列表
    List<Integer> selectWorksIdsByTimelineId(Integer timelineId);
    List<Map<String, Object>> selectYearArtStats();



}