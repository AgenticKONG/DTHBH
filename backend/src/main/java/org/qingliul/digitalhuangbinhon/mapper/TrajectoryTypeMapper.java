package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.*;
import org.qingliul.digitalhuangbinhon.entity.TrajectoryType;
import java.util.List;

@Mapper
public interface TrajectoryTypeMapper {

    @Select("SELECT * FROM trajectory_type")
    List<TrajectoryType> selectAll();

    @Select("SELECT * FROM trajectory_type WHERE type_id = #{id}")
    TrajectoryType selectById(@Param("id") Integer id);

    @Insert("INSERT INTO trajectory_type (type_id, type_name, type_desc) " +
            "VALUES (#{typeId}, #{typeName}, #{typeDesc})")
    int insert(TrajectoryType type);

    @Update("UPDATE trajectory_type SET type_name=#{typeName}, type_desc=#{typeDesc} " +
            "WHERE type_id = #{typeId}")
    int update(TrajectoryType type);

    @Delete("DELETE FROM trajectory_type WHERE type_id = #{id}")
    int deleteById(@Param("id") Integer id);
}