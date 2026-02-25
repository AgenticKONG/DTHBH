package org.qingliul.digitalhuangbinhon.controller;

import org.qingliul.digitalhuangbinhon.common.ApiResponse;
import org.qingliul.digitalhuangbinhon.entity.vo.WorksVO;
import org.qingliul.digitalhuangbinhon.service.WorksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/works")
public class WorksController {

    @Autowired
    private WorksService worksService;

    /**
     * 作品列表接口
     * GET /api/works/list
     *
     * 参数：
     * - creation_year: 创作年份（可选）
     * - works_name: 作品名称关键词（可选）
     * - category: 作品分类（可选）
     * - tags: 标签名称（可选，兼容旧版）
     * - tag_ids: 标签ID列表，逗号分隔（可选）
     * - art_period: 艺术时期（可选）
     * - startYear: 开始年份（可选）
     * - endYear: 结束年份（可选）
     * - page: 页码（可选，默认1）
     * - size: 每页条数（可选，默认12）
     */
    @GetMapping("/list")
    public ApiResponse<Map<String, Object>> getWorksList(
            @RequestParam(required = false) Integer creation_year,
            @RequestParam(required = false) String works_name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String tag_ids,
            @RequestParam(required = false) String art_period,
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size) {

        Map<String, Object> result = worksService.getWorksList(
                creation_year, works_name, category, tags, tag_ids, art_period, startYear, endYear, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 获取作品分类统计
     * GET /api/works/category/stats
     */
    @GetMapping("/category/stats")
    public ApiResponse<List<Map<String, Object>>> getCategoryStats() {
        List<Map<String, Object>> stats = worksService.getCategoryStats();
        return ApiResponse.success(stats);
    }

    /**
     * 获取作品分类统计（带总数）
     * GET /api/works/category/stats-with-total
     */
    @GetMapping("/category/stats-with-total")
    public ApiResponse<Map<String, Object>> getCategoryStatsWithTotal() {
        List<Map<String, Object>> stats = worksService.getCategoryStats();
        Integer total = 0;

        // 计算总数
        for (Map<String, Object> stat : stats) {
            total += ((Number) stat.get("count")).intValue();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("categories", stats);

        return ApiResponse.success(result);
    }

    /**
     * 作品详情接口
     * GET /api/works/detail
     *
     * 参数：
     * - works_id: 作品ID（必填）
     */
    @GetMapping("/detail")
    public ApiResponse<WorksVO> getWorksDetail(
            @RequestParam("works_id") Integer works_id) {

        if (works_id == null) {
            return ApiResponse.badRequest("参数错误：works_id不能为空");
        }

        WorksVO worksVO = worksService.getWorksDetail(works_id);
        if (worksVO == null) {
            return ApiResponse.notFound("未找到该作品");
        }

        return ApiResponse.success(worksVO);
    }

    /**
     * 获取所有标签列表（带统计）
     * GET /api/works/tags
     */
    @GetMapping("/tags")
    public ApiResponse<List<Map<String, Object>>> getAllTags() {
        List<Map<String, Object>> tags = worksService.getAllTags();
        return ApiResponse.success(tags);
    }

    /**
     * 根据标签获取作品列表
     * GET /api/works/by-tag
     *
     * 参数：
     * - tag_id: 标签ID（必填）
     * - page: 页码（可选，默认1）
     * - size: 每页条数（可选，默认10）
     */
    @GetMapping("/by-tag")
    public ApiResponse<Map<String, Object>> getWorksByTag(
            @RequestParam("tag_id") Integer tagId,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        if (tagId == null || tagId <= 0) {
            return ApiResponse.badRequest("参数错误：tag_id必须为正整数");
        }

        Map<String, Object> result = worksService.getWorksByTag(tagId, page, size);
        return ApiResponse.success(result);
    }

    @GetMapping("/tags/search")
    public ApiResponse<List<Map<String, Object>>> searchTags(
            @RequestParam(required = false) String keyword) {
        List<Map<String, Object>> tags = worksService.searchTags(keyword);
        return ApiResponse.success(tags);
    }

    @GetMapping("/by-period")
    public ApiResponse<Map<String, Object>> byPeriod(
            @RequestParam String period,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        // 时期 -> 年份区间
        int[] range = switch (period) {
            case "early"  -> new int[]{1865, 1900};
            case "middle" -> new int[]{1901, 1930};
            case "late"   -> new int[]{1931, 1955};
            default -> throw new IllegalArgumentException("period 只能是 early/middle/late");
        };

        Map<String, Object> res = worksService.getWorksByYearRange(range[0], range[1], page, size);
        return ApiResponse.success(res);
    }

    /**
     * 测试接口
     * GET /api/works/test
     */
    @GetMapping("/test")
    public ApiResponse<String> test() {
        return ApiResponse.success("作品接口测试成功！");
    }
}