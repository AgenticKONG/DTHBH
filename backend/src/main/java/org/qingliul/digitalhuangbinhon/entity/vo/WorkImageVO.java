package org.qingliul.digitalhuangbinhon.entity.vo;

import lombok.Data;

// 图片视图对象
@Data
public class WorkImageVO {
    private String imgType;
    private String imgUrl;
    private String imgDesc;

    public String getImgType() {
        return imgType;
    }

    public void setImgType(String imgType) {
        this.imgType = imgType;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public String getImgDesc() {
        return imgDesc;
    }

    public void setImgDesc(String imgDesc) {
        this.imgDesc = imgDesc;
    }

}
