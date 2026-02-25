package org.qingliul.digitalhuangbinhon.entity;

public class TrajectoryType {
    private Integer typeId;
    private String typeName;
    private String typeDesc;

    public TrajectoryType() {
    }

    public TrajectoryType(Integer typeId, String typeName, String typeDesc) {
        this.typeId = typeId;
        this.typeName = typeName;
        this.typeDesc = typeDesc;
    }

    // Getter和Setter
    public Integer getTypeId() {
        return typeId;
    }

    public void setTypeId(Integer typeId) {
        this.typeId = typeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getTypeDesc() {
        return typeDesc;
    }

    public void setTypeDesc(String typeDesc) {
        this.typeDesc = typeDesc;
    }
}