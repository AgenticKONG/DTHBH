package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.*;
import org.qingliul.digitalhuangbinhon.entity.TimelineEvent;
import java.util.List;

@Mapper
public interface TimelineEventMapper {
    List<TimelineEvent> findAllOrderByYear();
    TimelineEvent findById(@Param("eventId") Integer eventId);
    /* 新增：按地点查人生大事 */
    @Select("SELECT timeline_id AS eventId, " +
            "year, " +
            "event_title AS title, " +
            "event_detail AS description " +
            "FROM life_timeline " +
            "WHERE location_name = #{locationName} " +
            "ORDER BY year ASC")
    List<TimelineEvent> selectByLocation(@Param("locationName") String locationName);}