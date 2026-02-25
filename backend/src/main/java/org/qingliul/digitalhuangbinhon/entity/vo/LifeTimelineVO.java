package org.qingliul.digitalhuangbinhon.entity.vo;

import lombok.Data;
import java.util.List;

@Data
public class LifeTimelineVO {
    private Integer timelineId;
    private Integer year;
    private Integer month;
    private Integer day;
    private String eventTitle;
    private String eventDetail;

    // 关联的作品简要信息
    private List<RelatedWorksVO> relatedWorks;

    @Data
    public static class RelatedWorksVO {
        private Integer worksId;
        private String worksName;
        private Integer creationYear;
        private String thumbnailUrl;
    }

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

    public List<RelatedWorksVO> getRelatedWorks() {
        return relatedWorks;
    }

    public void setRelatedWorks(List<RelatedWorksVO> relatedWorks) {
        this.relatedWorks = relatedWorks;
    }
}