package org.qingliul.digitalhuangbinhon.util;

import org.qingliul.digitalhuangbinhon.config.ResourceConfig;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 资源工具类
 * 用于处理资源URL的转换
 */
@Component
public class ResourceUtil {

    private final ResourceConfig resourceConfig;

    public ResourceUtil(ResourceConfig resourceConfig) {
        this.resourceConfig = resourceConfig;
    }

    /**
     * 将相对路径转换为完整的资源URL
     */
    public String toResourceUrl(String path) {
        return resourceConfig.getResourceUrl(path);
    }

    /**
     * 处理作品数据，转换图片URL
     */
    public Map<String, Object> processWorkImageUrl(Map<String, Object> work) {
        if (work != null && work.containsKey("image_url")) {
            String imageUrl = (String) work.get("image_url");
            work.put("image_url", resourceConfig.getResourceUrl(imageUrl));
        }
        if (work != null && work.containsKey("thumbnail_url")) {
            String thumbnailUrl = (String) work.get("thumbnail_url");
            work.put("thumbnail_url", resourceConfig.getResourceUrl(thumbnailUrl));
        }
        return work;
    }

    /**
     * 批量处理作品数据，转换图片URL
     */
    public List<Map<String, Object>> processWorkImageUrlList(List<Map<String, Object>> works) {
        if (works == null || works.isEmpty()) {
            return works;
        }
        return works.stream()
                .map(this::processWorkImageUrl)
                .collect(Collectors.toList());
    }

    /**
     * 处理人物数据，转换头像URL
     */
    public Map<String, Object> processPersonImageUrl(Map<String, Object> person) {
        if (person != null && person.containsKey("avatar_url")) {
            String avatarUrl = (String) person.get("avatar_url");
            person.put("avatar_url", resourceConfig.getResourceUrl(avatarUrl));
        }
        return person;
    }

    /**
     * 批量处理人物数据，转换头像URL
     */
    public List<Map<String, Object>> processPersonImageUrlList(List<Map<String, Object>> persons) {
        if (persons == null || persons.isEmpty()) {
            return persons;
        }
        return persons.stream()
                .map(this::processPersonImageUrl)
                .collect(Collectors.toList());
    }
}