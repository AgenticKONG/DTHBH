package org.qingliul.digitalhuangbinhon.controller;

import org.qingliul.digitalhuangbinhon.common.ApiResponse;
import org.qingliul.digitalhuangbinhon.dto.*;
import org.qingliul.digitalhuangbinhon.entity.TimelineEvent;
import org.qingliul.digitalhuangbinhon.service.RelationshipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 人际关系控制器
 * 提供黄宾虹交友网络相关的API接口
 * 
 * @author Generated
 */
@RestController
@RequestMapping("/api/huangbinhong")
public class RelationshipController {

    private static final Logger logger = LoggerFactory.getLogger(RelationshipController.class);

    @Autowired
    private RelationshipService relationshipService;

    /**
     * 获取所有地点及当地好友
     * 
     * GET /api/huangbinhong/locations
     * 
     * @return 包含所有地点及其好友信息的响应
     *         响应格式: { "code": 200, "msg": "ok", "data": [LocationDTO...] }
     */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<LocationDTO>>> getLocations() {
        logger.info("Request received: GET /api/huangbinhong/locations");
        try {
            List<LocationDTO> locations = relationshipService.getLocations();
            logger.info("Successfully retrieved {} locations", locations.size());
            return ResponseEntity.ok(ApiResponse.success(locations));
        } catch (Exception e) {
            logger.error("Error retrieving locations", e);
            throw e; // 由全局异常处理器处理
        }
    }
    @GetMapping("/footprints")
    public ResponseEntity<ApiResponse<List<FootprintVo>>> footprints() {
        List<FootprintVo> data = relationshipService.getFootprints();
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    @GetMapping("/location-events")
    public ResponseEntity<ApiResponse<List<TimelineEvent>>> getLocationEvents(
            @RequestParam("location") String location) {
        logger.info("Request received: GET /api/huangbinhong/location-events location={}", location);
        try {
            List<TimelineEvent> events = relationshipService.getLocationEvents(location);
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            logger.error("Error retrieving location events", e);
            throw e;
        }
    }
    /**
     * 获取时间轴事件
     * 
     * GET /api/huangbinhong/timeline
     * 
     * @return 包含所有时间轴事件的响应
     *         响应格式: { "code": 200, "msg": "ok", "data": [TimelineEventDTO...] }
     */
    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<List<TimelineEventDTO>>> getTimeline() {
        logger.info("Request received: GET /api/huangbinhong/timeline");
        try {
            List<TimelineEventDTO> timelineEvents = relationshipService.getTimelineEvents();
            logger.info("Successfully retrieved {} timeline events", timelineEvents.size());
            return ResponseEntity.ok(ApiResponse.success(timelineEvents));
        } catch (Exception e) {
            logger.error("Error retrieving timeline events", e);
            throw e; // 由全局异常处理器处理
        }
    }

    /**
     * 时间轴事件详情
     * GET /api/huangbinhong/timeline/detail?timeline_id=123
     */
    @GetMapping("/timeline/detail")
    public ResponseEntity<ApiResponse<TimelineEventDTO>> getTimelineDetail(@RequestParam("timeline_id") Integer timeline_id) {
        logger.info("Request received: GET /api/huangbinhong/timeline/detail timeline_id={}", timeline_id);
        try {
            TimelineEventDTO dto = relationshipService.getTimelineEventById(timeline_id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (Exception e) {
            logger.error("Error retrieving timeline detail", e);
            throw e;
        }
    }

    /**
     * 一次性获取全量数据
     * 包含核心人物信息、所有地点及当地好友、所有时间轴事件
     * 
     * GET /api/huangbinhong/all
     * 
     * @return 包含全量数据的响应
     *         响应格式: { "code": 200, "msg": "ok", "data": { "core": {...}, "locations": [...], "timelineEvents": [...] } }
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<AllDataDTO>> getAll() {
        logger.info("Request received: GET /api/huangbinhong/all");
        try {
            AllDataDTO allData = relationshipService.getAllData();
            logger.info("Successfully retrieved all data");
            return ResponseEntity.ok(ApiResponse.success(allData));
        } catch (Exception e) {
            logger.error("Error retrieving all data", e);
            throw e; // 由全局异常处理器处理
        }
    }

    /**
     * 人物详情
     * GET /api/huangbinhong/person/detail?person_id=123
     */
    @GetMapping("/person/detail")
    public ResponseEntity<ApiResponse<PersonDTO>> getPersonDetail(@RequestParam("person_id") Integer person_id) {
        logger.info("Request received: GET /api/huangbinhong/person/detail person_id={}", person_id);
        try {
            PersonDTO dto = relationshipService.getPersonById(person_id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (Exception e) {
            logger.error("Error retrieving person detail", e);
            throw e;
        }
    }
}
