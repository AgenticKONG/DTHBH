package org.qingliul.digitalhuangbinhon.entity.vo;

import lombok.Data;

@Data
public class TimeEvent {
    private String year;
    private String event;

    public TimeEvent(String year, String event) {
        this.year = year;
        this.event = event;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }
}
