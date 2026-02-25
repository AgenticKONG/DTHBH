package org.qingliul.digitalhuangbinhon.entity;



import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class LifeTimeline {
    private Integer timelineId;
    private Integer year;
    private Integer month;
    private Integer day;
    private String eventTitle;
    private String eventDetail;
    private Date createTime;
    private Date updateTime;

    // 关联的作品列表（用于详情接口）
    private List<Works> relatedWorks;

    public Integer getTimelineId() {
        return timelineId;
    }

    public void setTimelineId(Integer timelineId) {
        this.timelineId = timelineId;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getEventDetail() {
        return eventDetail;
    }

    public void setEventDetail(String eventDetail) {
        this.eventDetail = eventDetail;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public List<Works> getRelatedWorks() {
        return relatedWorks;
    }

    public void setRelatedWorks(List<Works> relatedWorks) {
        this.relatedWorks = relatedWorks;
    }
}