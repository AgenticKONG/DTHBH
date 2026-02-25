package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.qingliul.digitalhuangbinhon.entity.Person;

import java.util.List;

@Mapper
public interface PersonMapper {
    Person findById(@Param("personId") Integer personId);
    List<Person> findAll();
}