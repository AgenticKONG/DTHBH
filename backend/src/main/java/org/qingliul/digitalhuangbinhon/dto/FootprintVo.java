package org.qingliul.digitalhuangbinhon.dto;

import lombok.Data;
import org.qingliul.digitalhuangbinhon.entity.vo.TimeEvent;


import java.util.List;

@Data
public class FootprintVo {
    private Object id;            // 城市名
    private String name;          // 同上
    private String type;          // birthplace / residence / travel
    private String year;          // 年份范围
    private List<Double> coordinates;
    private String description;
    private Integer importance;
    private String typeLabel;
    private String typeClass;
    private List<TimeEvent> timeEvents;

    public Object getId() {
        return id;
    }

    public void setId(Object id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public List<Double> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<Double> coordinates) {
        this.coordinates = coordinates;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getImportance() {
        return importance;
    }

    public void setImportance(Integer importance) {
        this.importance = importance;
    }

    public String getTypeLabel() {
        return typeLabel;
    }

    public void setTypeLabel(String typeLabel) {
        this.typeLabel = typeLabel;
    }

    public String getTypeClass() {
        return typeClass;
    }

    public void setTypeClass(String typeClass) {
        this.typeClass = typeClass;
    }

    public List<TimeEvent> getTimeEvents() {
        return timeEvents;
    }

    public void setTimeEvents(List<TimeEvent> timeEvents) {
        this.timeEvents = timeEvents;
    }
}
