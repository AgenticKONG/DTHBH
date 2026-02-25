package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.*;
import org.qingliul.digitalhuangbinhon.entity.TrajectoryPoint;
import java.util.List;



@Mapper
public interface TrajectoryPointMapper {
    List<TrajectoryPoint> findAll();
}
