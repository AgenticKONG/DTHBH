package org.qingliul.digitalhuangbinhon.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Works {
    private Integer worksId;                // 作品ID
    private String worksName;               // 作品名称
    private Integer creationYear;           // 创作年份
    private String creationTimeDetail;      // 创作细节
    private String size;                    // 作品尺寸
    private String material;                // 创作材料
    private String category;                // 分类（书法/画）
    private String collectionInstitution;   // 馆藏机构
    private String collectionLocation;      // 馆藏地点
    private String artPeriod;               // 艺术时期
    private String worksDesc;               // 作品描述
    private LocalDateTime createTime;       // 创建时间
    private LocalDateTime updateTime;       // 更新时间

    public String getArtPeriod() {
        return artPeriod;
    }

    public void setArtPeriod(String artPeriod) {
        this.artPeriod = artPeriod;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getWorksId() {
        return worksId;
    }

    public void setWorksId(Integer worksId) {
        this.worksId = worksId;
    }

    public String getWorksName() {
        return worksName;
    }

    public void setWorksName(String worksName) {
        this.worksName = worksName;
    }

    public Integer getCreationYear() {
        return creationYear;
    }

    public void setCreationYear(Integer creationYear) {
        this.creationYear = creationYear;
    }

    public String getCreationTimeDetail() {
        return creationTimeDetail;
    }

    public void setCreationTimeDetail(String creationTimeDetail) {
        this.creationTimeDetail = creationTimeDetail;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getCollectionInstitution() {
        return collectionInstitution;
    }

    public void setCollectionInstitution(String collectionInstitution) {
        this.collectionInstitution = collectionInstitution;
    }

    public String getCollectionLocation() {
        return collectionLocation;
    }

    public void setCollectionLocation(String collectionLocation) {
        this.collectionLocation = collectionLocation;
    }

    public String getWorksDesc() {
        return worksDesc;
    }

    public void setWorksDesc(String worksDesc) {
        this.worksDesc = worksDesc;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}