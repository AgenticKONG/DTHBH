package org.qingliul.digitalhuangbinhon.entity;

import org.qingliul.digitalhuangbinhon.entity.Person;

import java.time.LocalDateTime;

public class PersonRelationship {
    private Integer relationId;
    private Integer sourcePersonId;   // 改为ID，不是对象
    private Integer targetPersonId;   // 改为ID，不是对象
    private String relationType;
    private Integer importance;
    private String relationEvent;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // 扩展字段（用于JOIN查询）
    private Person sourcePerson;
    private Person targetPerson;

    public Integer getRelationId() {
        return relationId;
    }

    public void setRelationId(Integer relationId) {
        this.relationId = relationId;
    }

    public Integer getSourcePersonId() {
        return sourcePersonId;
    }

    public void setSourcePersonId(Integer sourcePersonId) {
        this.sourcePersonId = sourcePersonId;
    }

    public Integer getTargetPersonId() {
        return targetPersonId;
    }

    public void setTargetPersonId(Integer targetPersonId) {
        this.targetPersonId = targetPersonId;
    }

    public String getRelationType() {
        return relationType;
    }

    public void setRelationType(String relationType) {
        this.relationType = relationType;
    }

    public Integer getImportance() {
        return importance;
    }

    public void setImportance(Integer importance) {
        this.importance = importance;
    }

    public String getRelationEvent() {
        return relationEvent;
    }

    public void setRelationEvent(String relationEvent) {
        this.relationEvent = relationEvent;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public Person getSourcePerson() {
        return sourcePerson;
    }

    public void setSourcePerson(Person sourcePerson) {
        this.sourcePerson = sourcePerson;
    }

    public Person getTargetPerson() {
        return targetPerson;
    }

    public void setTargetPerson(Person targetPerson) {
        this.targetPerson = targetPerson;
    }
}