package org.qingliul.digitalhuangbinhon.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * 性能监控切面
 * 记录方法执行时间，用于性能分析
 */
@Slf4j
@Aspect
@Component
public class PerformanceMonitorAspect {

    // 慢查询阈值（毫秒）
    private static final long SLOW_THRESHOLD = 1000;

    /**
     * 定义切点：所有Controller方法
     */
    @Pointcut("execution(* org.qingliul.digitalhuangbinhon.controller..*.*(..))")
    public void controllerMethods() {}

    /**
     * 定义切点：所有Service方法
     */
    @Pointcut("execution(* org.qingliul.digitalhuangbinhon.service..*.*(..))")
    public void serviceMethods() {}

    /**
     * 定义切点：所有Mapper方法
     */
    @Pointcut("execution(* org.qingliul.digitalhuangbinhon.mapper..*.*(..))")
    public void mapperMethods() {}

    /**
     * 环绕通知：记录方法执行时间
     */
    @Around("controllerMethods() || serviceMethods() || mapperMethods()")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        try {
            // 执行目标方法
            Object result = joinPoint.proceed();
            
            // 计算执行时间
            long duration = System.currentTimeMillis() - startTime;
            
            // 根据执行时间记录不同级别的日志
            if (duration > SLOW_THRESHOLD) {
                log.warn("Slow Method - {}.{}() - {}ms", className, methodName, duration);
            } else if (duration > 100) {
                log.info("Method - {}.{}() - {}ms", className, methodName, duration);
            }
            
            return result;
        } catch (Throwable e) {
            // 记录异常
            long duration = System.currentTimeMillis() - startTime;
            log.error("Method Failed - {}.{}() - {}ms - Error: {}",
                    className, methodName, duration, e.getMessage());
            throw e;
        }
    }
}