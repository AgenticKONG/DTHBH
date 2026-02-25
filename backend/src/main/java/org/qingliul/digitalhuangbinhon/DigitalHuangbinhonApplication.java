package org.qingliul.digitalhuangbinhon;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@MapperScan("org.qingliul.digitalhuangbinhon.mapper")  // 添加这行
@SpringBootApplication
public class DigitalHuangbinhonApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalHuangbinhonApplication.class, args);
    }

}
