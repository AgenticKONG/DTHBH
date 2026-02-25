package org.qingliul.digitalhuangbinhon.service;


import org.qingliul.digitalhuangbinhon.dto.*;
import org.qingliul.digitalhuangbinhon.dto.FootprintVo;
import org.qingliul.digitalhuangbinhon.entity.TimelineEvent;

import java.util.List;

public interface RelationshipService {

    CoreDTO getCore();

    List<LocationDTO> getLocations();

    List<TimelineEventDTO> getTimelineEvents();

    TimelineEventDTO getTimelineEventById(Integer id);

    PersonDTO getPersonById(Integer id);

    AllDataDTO getAllData();
    List<FootprintVo> getFootprints();
    List<TimelineEvent> getLocationEvents(String locationName);
}