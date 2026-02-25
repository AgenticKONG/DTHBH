package org.qingliul.digitalhuangbinhon.entity.vo;

import lombok.Data;
import java.util.List;

@Data
public class WorksVO {
    private Integer worksId;
    private String worksName;
    private Integer creationYear;
    private String creationTimeDetail;
    private String size;
    private String material;
    private String collectionInstitution;
    private String worksDesc;
    private String category;
    private String artPeriod;
    private List<String> tags;  // 标签列表
    private List<WorkImageVO> images;  // 图片列表

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

    public String getWorksDesc() {
        return worksDesc;
    }

    public void setWorksDesc(String worksDesc) {
        this.worksDesc = worksDesc;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<WorkImageVO> getImages() {
        return images;
    }

    public void setImages(List<WorkImageVO> images) {
        this.images = images;
    }

}

