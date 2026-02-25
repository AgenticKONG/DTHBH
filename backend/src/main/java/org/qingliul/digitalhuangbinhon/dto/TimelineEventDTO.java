package org.qingliul.digitalhuangbinhon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 时间轴事件 DTO
 */
public class TimelineEventDTO {
    /** 唯一 id（序列）; 序列化为 snake_case 以兼容前端不同命名 */
    @JsonProperty("timeline_id")
    private Integer timelineId;

    private Integer year;
    private String person;
    private String title;
    private String description;
    private Integer artWeight;
    private Integer hbhAge;
    private Integer friendAge;

    public TimelineEventDTO() {
    }

    public TimelineEventDTO(Integer timelineId, Integer year, String person, String title, String description, Integer artWeight, Integer hbhAge, Integer friendAge) {
        this.timelineId = timelineId;
        this.year = year;
        this.person = person;
        this.title = title;
        this.description = description;
        this.artWeight = artWeight;
        this.hbhAge = hbhAge;
        this.friendAge = friendAge;
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

    public String getPerson() {
        return person;
    }

    public void setPerson(String person) {
        this.person = person;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getArtWeight() {
        return artWeight;
    }

    public void setArtWeight(Integer artWeight) {
        this.artWeight = artWeight;
    }

    public Integer getHbhAge() {
        return hbhAge;
    }

    public void setHbhAge(Integer hbhAge) {
        this.hbhAge = hbhAge;
    }

    public Integer getFriendAge() {
        return friendAge;
    }

    public void setFriendAge(Integer friendAge) {
        this.friendAge = friendAge;
    }

    // 为兼容前端可能使用的 snake_case 字段名，额外暴露 event_title / event_detail
    @JsonProperty("event_title")
    public String getEventTitle() {
        return this.title;
    }

    @JsonProperty("event_detail")
    public String getEventDetail() {
        return this.description;
    }

    public static TimelineEventDTOBuilder builder() {
        return new TimelineEventDTOBuilder();
    }

    public static class TimelineEventDTOBuilder {
        private Integer timelineId;
        private Integer year;
        private String person;
        private String title;
        private String description;
        private Integer artWeight;
        private Integer hbhAge;
        private Integer friendAge;

        TimelineEventDTOBuilder() {
        }

        public TimelineEventDTOBuilder timelineId(Integer timelineId) {
            this.timelineId = timelineId;
            return this;
        }

        public TimelineEventDTOBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public TimelineEventDTOBuilder person(String person) {
            this.person = person;
            return this;
        }

        public TimelineEventDTOBuilder title(String title) {
            this.title = title;
            return this;
        }

        public TimelineEventDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public TimelineEventDTOBuilder artWeight(Integer artWeight) {
            this.artWeight = artWeight;
            return this;
        }

        public TimelineEventDTOBuilder hbhAge(Integer hbhAge) {
            this.hbhAge = hbhAge;
            return this;
        }

        public TimelineEventDTOBuilder friendAge(Integer friendAge) {
            this.friendAge = friendAge;
            return this;
        }

        public TimelineEventDTO build() {
            return new TimelineEventDTO(this.timelineId, this.year, this.person, this.title, this.description, this.artWeight, this.hbhAge, this.friendAge);
        }
    }
}

