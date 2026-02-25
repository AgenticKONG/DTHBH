package org.qingliul.digitalhuangbinhon.controller;

import org.qingliul.digitalhuangbinhon.common.ApiResponse;
import org.qingliul.digitalhuangbinhon.service.LifeTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timeline")
public class LifeTimelineController {

    @Autowired
    private LifeTimelineService lifeTimelineService;

    /**
     * 生平事件列表接口
     * GET /api/timeline/list
     *
     * 参数：
     * - year: 年份（可选）
     * - page: 页码（可选，默认1）
     * - size: 每页条数（可选，默认10）
     */
    @GetMapping("/list")
    public ApiResponse<Map<String, Object>> getLifeTimelineList(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        Map<String, Object> result = lifeTimelineService.getLifeTimelineList(year, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 生平事件详情接口
     * GET /api/timeline/detail
     *
     * 参数：
     * - timeline_id: 生平事件ID（必填）
     */
    @GetMapping("/detail")
    public ApiResponse<Map<String, Object>> getLifeTimelineDetail(
            @RequestParam("timeline_id") Integer timelineId) {

        if (timelineId == null) {
            return ApiResponse.badRequest("参数错误：timeline_id不能为空");
        }

        Map<String, Object> timelineDetail = lifeTimelineService.getLifeTimelineDetail(timelineId);
        if (timelineDetail == null) {
            return ApiResponse.notFound("未找到该生平事件");
        }

        return ApiResponse.success(timelineDetail);
    }

    @GetMapping("/year/art-stats")
    public ApiResponse<List<Map<String, Object>>> getYearArtStats() {
        return ApiResponse.success(lifeTimelineService.selectYearArtStats());
    }

    /**
     * 测试接口
     * GET /api/timeline/test
     */
    @GetMapping("/test")
    public ApiResponse<String> test() {
        return ApiResponse.success("生平编年体接口测试成功！");
    }
}