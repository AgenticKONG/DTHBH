package org.qingliul.digitalhuangbinhon.dto;

import java.util.List;

/**
 * 全量数据 DTO
 */
public class AllDataDTO {
    private CoreDTO core;
    private List<LocationDTO> locations;
    private List<TimelineEventDTO> timelineEvents;

    public AllDataDTO() {
    }

    public AllDataDTO(CoreDTO core, List<LocationDTO> locations, List<TimelineEventDTO> timelineEvents) {
        this.core = core;
        this.locations = locations;
        this.timelineEvents = timelineEvents;
    }

    public CoreDTO getCore() {
        return core;
    }

    public void setCore(CoreDTO core) {
        this.core = core;
    }

    public List<LocationDTO> getLocations() {
        return locations;
    }

    public void setLocations(List<LocationDTO> locations) {
        this.locations = locations;
    }

    public List<TimelineEventDTO> getTimelineEvents() {
        return timelineEvents;
    }

    public void setTimelineEvents(List<TimelineEventDTO> timelineEvents) {
        this.timelineEvents = timelineEvents;
    }

    public static AllDataDTOBuilder builder() {
        return new AllDataDTOBuilder();
    }

    public static class AllDataDTOBuilder {
        private CoreDTO core;
        private List<LocationDTO> locations;
        private List<TimelineEventDTO> timelineEvents;

        AllDataDTOBuilder() {
        }

        public AllDataDTOBuilder core(CoreDTO core) {
            this.core = core;
            return this;
        }

        public AllDataDTOBuilder locations(List<LocationDTO> locations) {
            this.locations = locations;
            return this;
        }

        public AllDataDTOBuilder timelineEvents(List<TimelineEventDTO> timelineEvents) {
            this.timelineEvents = timelineEvents;
            return this;
        }

        public AllDataDTO build() {
            return new AllDataDTO(this.core, this.locations, this.timelineEvents);
        }
    }
}

