package org.qingliul.digitalhuangbinhon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 资源配置
 * 支持本地存储和云存储（如阿里云OSS、MinIO等）
 */
@Configuration
public class ResourceConfig {

    /**
     * 资源存储类型: local, oss, minio
     */
    @Value("${resource.storage-type:local}")
    private String storageType;

    /**
     * 本地资源访问URL前缀
     */
    @Value("${resource.local.base-url:http://localhost:8080}")
    private String localBaseUrl;

    /**
     * OSS配置
     */
    @Value("${resource.oss.endpoint:}")
    private String ossEndpoint;

    @Value("${resource.oss.bucket-name:}")
    private String ossBucketName;

    @Value("${resource.oss.access-key-id:}")
    private String ossAccessKeyId;

    @Value("${resource.oss.access-key-secret:}")
    private String ossAccessKeySecret;

    @Value("${resource.oss.base-url:}")
    private String ossBaseUrl;

    /**
     * 资源URL前缀
     */
    public String getResourceBaseUrl() {
        if ("oss".equals(storageType)) {
            return ossBaseUrl;
        }
        return localBaseUrl;
    }

    /**
     * 根据文件名获取完整资源URL
     */
    public String getResourceUrl(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        
        // 如果已经是完整URL，直接返回
        if (filename.startsWith("http://") || filename.startsWith("https://")) {
            return filename;
        }
        
        // 构建完整URL
        String baseUrl = getResourceBaseUrl();
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        
        if (filename.startsWith("/")) {
            filename = filename.substring(1);
        }
        
        return baseUrl + filename;
    }

    // Getters
    public String getStorageType() {
        return storageType;
    }

    public String getLocalBaseUrl() {
        return localBaseUrl;
    }

    public String getOssEndpoint() {
        return ossEndpoint;
    }

    public String getOssBucketName() {
        return ossBucketName;
    }

    public String getOssAccessKeyId() {
        return ossAccessKeyId;
    }

    public String getOssAccessKeySecret() {
        return ossAccessKeySecret;
    }
}