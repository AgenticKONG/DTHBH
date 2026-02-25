package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.qingliul.digitalhuangbinhon.entity.TrajectoryPersonRel;

import java.util.List;

@Mapper
public interface TrajectoryPersonRelMapper {
    List<TrajectoryPersonRel> findByPointIds(@Param("pointIds") List<Integer> pointIds);
}