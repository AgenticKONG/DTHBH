package org.qingliul.digitalhuangbinhon.service.impl;

import org.qingliul.digitalhuangbinhon.entity.Works;
import org.qingliul.digitalhuangbinhon.entity.vo.WorkImageVO;
import org.qingliul.digitalhuangbinhon.entity.vo.WorksVO;
import org.qingliul.digitalhuangbinhon.mapper.WorksMapper;
import org.qingliul.digitalhuangbinhon.service.WorksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorksServiceImpl implements WorksService {

    @Autowired
    private WorksMapper worksMapper;

    @Override
    public Map<String, Object> getWorksList(Integer creationYear,
                                            String worksName,
                                            String category,
                                            String tags,
                                            String tagIds,
                                            String artPeriod,
                                            Integer startYear,
                                            Integer endYear,
                                            Integer page,
                                            Integer size) {

        page = (page == null || page < 1) ? 1 : page;
        size = (size == null || size < 1) ? 12 : size;
        int start = (page - 1) * size;

        Map<String, Object> params = new HashMap<>();
        params.put("creationYear", creationYear);
        params.put("worksName", worksName);
        params.put("category", category);
        params.put("tags", tags);
        params.put("tag_ids", tagIds);
        params.put("startYear", startYear);
        params.put("art_period", artPeriod);
        params.put("endYear", endYear);
        params.put("start", start);
        params.put("size", size);

        List<Works> worksList = worksMapper.selectWorksList(params);
        int total = worksMapper.countWorksList(params);

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Works work : worksList) {
            Map<String, Object> item = new HashMap<>();
            item.put("worksId", work.getWorksId());
            item.put("worksName", work.getWorksName());
            item.put("creationYear", work.getCreationYear());
            item.put("category", work.getCategory());
            item.put("art_period", work.getArtPeriod());
            item.put("size", work.getSize());
            item.put("material", work.getMaterial());
            item.put("collectionInstitution", work.getCollectionInstitution());
            item.put("worksDesc", work.getWorksDesc());

            // 缩略图
            String thumbnailUrl = worksMapper.selectThumbnailUrl(work.getWorksId());
            item.put("thumbnailUrl", thumbnailUrl != null ? thumbnailUrl : "");

            // 标签
            List<String> tagList = worksMapper.selectTagsByWorksId(work.getWorksId());
            item.put("tags", tagList);

            resultList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("list", resultList);
        result.put("page", page);
        result.put("size", size);

        return result;
    }
    @Override
    public Map<String, Object> getWorksByYearRange(int startYear, int endYear,
                                                   int page, int size) {
        int start = (page - 1) * size;
        List<Works> list = worksMapper.selectWorksByYearRange(startYear, endYear, start, size);
        int total = worksMapper.countWorksByYearRange(startYear, endYear);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Works w : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("worksId", w.getWorksId());
            m.put("worksName", w.getWorksName());
            m.put("creationYear", w.getCreationYear());
            m.put("category", w.getCategory());
            m.put("size", w.getSize());
            m.put("material", w.getMaterial());
            m.put("collectionInstitution", w.getCollectionInstitution());
            m.put("worksDesc", w.getWorksDesc());
            m.put("thumbnailUrl", worksMapper.selectThumbnailUrl(w.getWorksId()));
            m.put("tags", worksMapper.selectTagsByWorksId(w.getWorksId()));
            items.add(m);
        }

        return Map.of(
                "list", items,
                "total", total,
                "page", page,
                "size", size
        );
    }
    @Override
    public List<Map<String, Object>> getAllTags() {
        return worksMapper.selectAllTags();
    }
    @Override
    public Map<String, Object> getWorksByTag(Integer tagId, Integer page, Integer size) {
        // 参数验证
        page = (page == null || page < 1) ? 1 : page;
        size = (size == null || size < 1) ? 10 : size;
        int start = (page - 1) * size;

        // 查询数据
        List<Works> worksList = worksMapper.selectWorksByTagId(tagId, start, size);
        Integer total = worksMapper.countWorksByTagId(tagId);

        // 处理结果
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Works work : worksList) {
            Map<String, Object> item = new HashMap<>();
            item.put("worksId", work.getWorksId());
            item.put("worksName", work.getWorksName());
            item.put("creationYear", work.getCreationYear());
            item.put("material", work.getMaterial());
            item.put("collectionInstitution", work.getCollectionInstitution());
            item.put("worksDesc", work.getWorksDesc());

            // 获取缩略图URL
            String thumbnailUrl = worksMapper.selectThumbnailUrl(work.getWorksId());
            item.put("thumbnailUrl", thumbnailUrl != null ? thumbnailUrl : "");

            // 获取标签（可选）
            try {
                List<String> tags = worksMapper.selectTagsByWorksId(work.getWorksId());
                item.put("tags", tags);
            } catch (Exception e) {
                // 标签获取失败不影响主要数据
                item.put("tags", new ArrayList<>());
            }

            resultList.add(item);
        }

        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("list", resultList);
        result.put("page", page);
        result.put("size", size);
        result.put("tagId", tagId);

        return result;
    }

    @Override
    public List<Map<String, Object>> searchTags(String keyword) {
        System.out.println("=== 搜索标签方法被调用 ===");
        System.out.println("关键词: '" + keyword + "'");

        // 如果关键词为空或null，返回所有标签
        if (keyword == null || keyword.trim().isEmpty()) {
            System.out.println("关键词为空，返回所有标签");
            return worksMapper.selectAllTags();
        }

        // 否则调用searchTags进行模糊搜索
        System.out.println("进行模糊搜索: " + keyword);
        return worksMapper.searchTags(keyword);
    }

    @Override
    public List<Map<String, Object>> getCategoryStats() {
        return worksMapper.selectCategoryStats();
    }

    @Override
    public WorksVO getWorksDetail(Integer worksId) {
        // 先实现基础功能，查询作品基本信息
        Works works = worksMapper.selectWorksById(worksId);
        if (works == null) {
            return null;
        }

        // 创建VO对象
        WorksVO worksVO = new WorksVO();
        worksVO.setWorksId(works.getWorksId());
        worksVO.setWorksName(works.getWorksName());
        worksVO.setCreationYear(works.getCreationYear());
        worksVO.setCreationTimeDetail(works.getCreationTimeDetail());
        worksVO.setSize(works.getSize());
        worksVO.setMaterial(works.getMaterial());
        worksVO.setCollectionInstitution(works.getCollectionInstitution());
        worksVO.setWorksDesc(works.getWorksDesc());
        worksVO.setArtPeriod(works.getArtPeriod());

        // 2. 查询标签信息
        try {
            List<String> tags = worksMapper.selectTagsByWorksId(worksId);
            worksVO.setTags(tags);
        } catch (Exception e) {
            e.printStackTrace();
            // 标签查询失败不影响基本信息返回
        }
        System.out.println(">>> artPeriod from DB: " + works.getArtPeriod());
        // TODO: 后面再添加标签和图片的查询
        // 3. 查询图片信息
        try {
            List<Map<String, Object>> imageList = worksMapper.selectImagesByWorksId(worksId);
            if (imageList != null && !imageList.isEmpty()) {
                List<WorkImageVO> images = new ArrayList<>();
                for (Map<String, Object> img : imageList) {
                    WorkImageVO imageVO = new WorkImageVO();
                    imageVO.setImgType((String) img.get("imgtype"));
                    imageVO.setImgUrl((String) img.get("imgurl"));
                    imageVO.setImgDesc((String) img.get("imgdesc"));
                    images.add(imageVO);
                }
                worksVO.setImages(images);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // 图片查询失败不影响基本信息返回
        }
        return worksVO;
    }
}