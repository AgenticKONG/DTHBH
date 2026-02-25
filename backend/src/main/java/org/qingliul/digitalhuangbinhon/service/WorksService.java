package org.qingliul.digitalhuangbinhon.service;

import org.qingliul.digitalhuangbinhon.entity.Works;
import org.qingliul.digitalhuangbinhon.entity.vo.WorksVO;

import java.util.List;
import java.util.Map;

public interface WorksService {

    // 获取作品列表
    Map<String, Object> getWorksList(
            Integer creationYear,
            String worksName,
            String category,
            String tags,
            String tagIds,
            String artPeriod,
            Integer startYear,
            Integer endYear,
            Integer page,
            Integer size);

    // 获取作品详情（带关联信息）
    WorksVO getWorksDetail(Integer worksId);
    // 新增标签相关方法
    List<Map<String, Object>> getAllTags();
    Map<String, Object> getWorksByTag(Integer tagId, Integer page, Integer size);
    List<Map<String, Object>> searchTags(String keyword);
    List<Map<String, Object>> getCategoryStats();
    public Map<String, Object> getWorksByYearRange(int startYear, int endYear,
                                                   int page, int size);
}