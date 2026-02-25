// ResponseVO.java
package org.qingliul.digitalhuangbinhon.entity.vo;

import lombok.Data;

@Data
public class ResponseVO<T> {
    private Integer code;    // 状态码
    private String msg;      // 消息
    private T data;          // 数据

    // 成功响应
    public static <T> ResponseVO<T> success(T data) {
        ResponseVO<T> response = new ResponseVO<>();
        response.setCode(200);
        response.setMsg("成功");
        response.setData(data);
        return response;
    }

    // 成功响应（带消息）
    public static <T> ResponseVO<T> success(String msg, T data) {
        ResponseVO<T> response = new ResponseVO<>();
        response.setCode(200);
        response.setMsg(msg);
        response.setData(data);
        return response;
    }

    // 错误响应
    public static <T> ResponseVO<T> error(Integer code, String msg) {
        ResponseVO<T> response = new ResponseVO<>();
        response.setCode(code);
        response.setMsg(msg);
        return response;
    }

    // 参数错误
    public static <T> ResponseVO<T> error(String msg) {
        return error(400, msg);
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

}