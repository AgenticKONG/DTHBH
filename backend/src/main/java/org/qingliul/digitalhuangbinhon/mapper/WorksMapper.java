package org.qingliul.digitalhuangbinhon.mapper;

import org.apache.ibatis.annotations.Param;
import org.qingliul.digitalhuangbinhon.entity.Works;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface WorksMapper {

    // 查询作品列表
    List<Works> selectWorksList(Map<String, Object> params);

    // 查询作品总数
    Integer countWorksList(Map<String, Object> params);

    // 根据ID查询作品详情
    Works selectWorksById(Integer worksId);
    List<Map<String, Object>> selectImagesByWorksId(@Param("worksId") Integer worksId);
    String selectThumbnailUrl(@Param("worksId") Integer worksId);
    // 搜索标签
    List<Map<String, Object>> searchTags(@Param("keyword") String keyword);
    // 查询所有标签（带作品数量统计）
    List<Map<String, Object>> selectAllTags();

    // 根据标签ID查询作品列表
    List<Works> selectWorksByTagId(@Param("tagId") Integer tagId,
                                   @Param("start") Integer start,
                                   @Param("size") Integer size);

    // 根据标签ID查询作品总数
    Integer countWorksByTagId(@Param("tagId") Integer tagId);

    // 根据作品ID查询标签列表
    List<String> selectTagsByWorksId(@Param("worksId") Integer worksId);
    List<Map<String, Object>> selectCategoryStats();
    List<Works> selectWorksByYearRange(
            @Param("startYear") int startYear,
            @Param("endYear") int endYear,
            @Param("start") int start,
            @Param("size") int size);

    int countWorksByYearRange(
            @Param("startYear") int startYear,
            @Param("endYear") int endYear);
}