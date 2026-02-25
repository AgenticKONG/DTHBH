package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.*;
import org.qingliul.digitalhuangbinhon.entity.PersonRelationship;
import java.util.List;

@Mapper
public interface PersonRelationshipMapper {

    // 根据发起方ID查询
    @Select("SELECT * FROM person_relationship WHERE source_person_id = #{personId}")
    List<PersonRelationship> selectBySourcePersonId(@Param("personId") Integer personId);

    // 根据目标方ID查询
    @Select("SELECT * FROM person_relationship WHERE target_person_id = #{personId}")
    List<PersonRelationship> selectByTargetPersonId(@Param("personId") Integer personId);

    @Select("SELECT * FROM person_relationship")
    List<PersonRelationship> selectAll();

    @Select("SELECT * FROM person_relationship WHERE relation_id = #{id}")
    PersonRelationship selectById(@Param("id") Integer id);

    @Insert("INSERT INTO person_relationship (source_person_id, target_person_id, " +
            "relation_type, importance, relation_event) " +
            "VALUES (#{sourcePersonId}, #{targetPersonId}, #{relationType}, " +
            "#{importance}, #{relationEvent})")
    @Options(useGeneratedKeys = true, keyProperty = "relationId")
    int insert(PersonRelationship relationship);

    @Update("UPDATE person_relationship SET source_person_id=#{sourcePersonId}, " +
            "target_person_id=#{targetPersonId}, relation_type=#{relationType}, " +
            "importance=#{importance}, relation_event=#{relationEvent} " +
            "WHERE relation_id = #{relationId}")
    int update(PersonRelationship relationship);

    @Delete("DELETE FROM person_relationship WHERE relation_id = #{id}")
    int deleteById(@Param("id") Integer id);
}